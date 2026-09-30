// Records a scripted walkthrough of the app to an mp4 at 60 fps.
// Frames come from Chrome's screencast at high density and are downscaled, which keeps text crisp.
// Usage: npm run demo:record            -> demo/cash-compass-demo.mp4 (1280x720)
//        npm run demo:record:mobile     -> demo/cash-compass-demo-mobile.mp4 (1080x2338, phone viewport)
import { mkdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import ffmpeg from 'ffmpeg-static'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const PROFILES = {
  desktop: {
    viewport: { width: 1280, height: 720 },
    scale: 2,
    output: { width: 1280, height: 720, file: 'cash-compass-demo.mp4' },
    touch: false,
    // Keeps targets away from the sticky header before interacting.
    safeArea: { top: 90, bottom: 90 },
  },
  mobile: {
    viewport: { width: 390, height: 844 },
    scale: 3,
    output: { width: 1080, height: 2338, file: 'cash-compass-demo-mobile.mp4' },
    touch: true,
    // The floating tab bar covers the bottom of the screen.
    safeArea: { top: 90, bottom: 150 },
  },
}

const DEVICE = process.argv.includes('--mobile') ? 'mobile' : 'desktop'
const profile = PROFILES[DEVICE]
const SIZE = profile.viewport
const FPS = 60
/** Multiplies every pause and animation; raise it to slow the whole demo down. */
const PACE = 1
const OUTPUT = path.resolve('demo', profile.output.file)

// Fake pointer: the screencast does not capture the OS cursor. Phones get a touch indicator instead of an arrow.
const CURSOR_SCRIPT = `
  window.addEventListener('DOMContentLoaded', () => {
    const touch = ${profile.touch}
    const style = document.createElement('style')
    style.textContent = \`
      #demo-cursor { position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none; transition: transform 120ms ease-out, opacity 160ms ease-out; }
      #demo-cursor.arrow { width: 24px; height: 24px; margin: -3px 0 0 -3px; filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.35)); }
      #demo-cursor.arrow.down { transform: scale(0.82); }
      #demo-cursor.finger { width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; opacity: 0.45;
        background: rgb(255 255 255 / 0.55); border: 2px solid rgb(20 20 20 / 0.45); box-shadow: 0 2px 8px rgb(0 0 0 / 0.25); }
      #demo-cursor.finger.down { opacity: 0.9; transform: scale(0.8); }
      .demo-ripple { position: fixed; z-index: 2147483646; pointer-events: none; width: 44px; height: 44px; margin: -22px 0 0 -22px;
        border-radius: 50%; border: 2px solid rgb(232 160 32 / 0.9); animation: demo-ripple 600ms ease-out forwards; }
      @keyframes demo-ripple { from { transform: scale(0.3); opacity: 1 } to { transform: scale(1.4); opacity: 0 } }
    \`
    document.head.append(style)
    const cursor = document.createElement('div')
    cursor.id = 'demo-cursor'
    cursor.className = touch ? 'finger' : 'arrow'
    if (!touch) cursor.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.9L4 19z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>'
    cursor.style.left = '-60px'
    document.body.append(cursor)
    document.addEventListener('mousemove', (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px' }, true)
    document.addEventListener('mousedown', (e) => {
      cursor.classList.add('down')
      const ripple = document.createElement('div')
      ripple.className = 'demo-ripple'
      ripple.style.left = e.clientX + 'px'
      ripple.style.top = e.clientY + 'px'
      document.body.append(ripple)
      setTimeout(() => ripple.remove(), 650)
    }, true)
    document.addEventListener('mouseup', () => cursor.classList.remove('down'), true)
  })
`

/** Streams screencast frames into ffmpeg at a constant frame rate, repeating frames while the page is idle. */
async function startRecorder(page) {
  await mkdir(path.dirname(OUTPUT), { recursive: true })
  const { width, height } = profile.output
  const encoder = spawn(
    ffmpeg,
    [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
      '-vf', `scale=${width}:${height}:flags=lanczos,setsar=1`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      OUTPUT,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  )
  const done = new Promise((resolve, reject) => encoder.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)))))

  const cdp = await page.context().newCDPSession(page)
  let start = 0
  let written = 0
  let captured = 0
  let last = null
  const fill = (seconds) => {
    const target = Math.floor(seconds * FPS)
    for (; last && written < target; written++) encoder.stdin.write(last)
  }

  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
    start ||= metadata.timestamp
    fill(metadata.timestamp - start)
    last = Buffer.from(data, 'base64')
    captured++
  })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: SIZE.width * profile.scale, maxHeight: SIZE.height * profile.scale })
  const wallStart = Date.now()

  return async function stop() {
    await cdp.send('Page.stopScreencast')
    const seconds = (Date.now() - wallStart) / 1000
    fill(seconds)
    encoder.stdin.end()
    await done
    console.log(`Captured ${captured} unique frames over ${seconds.toFixed(1)}s (${(captured / seconds).toFixed(1)} fps effective)`)
  }
}

const server = await createServer({ server: { port: 5199 }, logLevel: 'error' })
await server.listen()
const APP_URL = server.resolvedUrls?.local[0] ?? 'http://localhost:5199/'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: SIZE, deviceScaleFactor: profile.scale, isMobile: profile.touch, hasTouch: profile.touch, locale: 'es-ES' })
await context.addInitScript(CURSOR_SCRIPT)
const page = await context.newPage()

const pointer = { x: SIZE.width / 2, y: SIZE.height / 2 }
const pause = (ms) => page.waitForTimeout(ms * PACE)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Scrolls the window by `delta` pixels with an eased requestAnimationFrame animation. */
async function scroll(delta, duration = Math.min(2600, 700 + Math.abs(delta) * 1.6)) {
  await page.evaluate(
    ([delta, duration]) =>
      new Promise((resolve) => {
        const from = window.scrollY
        const to = Math.max(0, Math.min(from + delta, document.documentElement.scrollHeight - window.innerHeight))
        const began = performance.now()
        const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
        const tick = (now) => {
          const t = Math.min(1, (now - began) / duration)
          window.scrollTo(0, from + (to - from) * ease(t))
          if (t < 1) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      }),
    [delta, duration * PACE],
  )
  await pause(500)
}

async function moveTo(locator) {
  await locator.waitFor({ state: 'visible' })
  let box = await locator.boundingBox()
  if (!box) throw new Error(`Element not visible: ${locator}`)
  const { top, bottom } = profile.safeArea
  // Fixed elements (tab bar, header) report the same box after scrolling, so only scroll when it would help.
  if (box.y < top || box.y + box.height > SIZE.height - bottom) {
    await scroll(box.y + box.height / 2 - SIZE.height / 2)
    box = await locator.boundingBox()
  }
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  const from = { ...pointer }
  // Time-based so each glide lasts the same regardless of how fast Chrome answers.
  const duration = Math.min(1100, 450 + Math.hypot(x - from.x, y - from.y) * 0.7) * PACE
  const began = Date.now()
  for (let t = 0; t < 1; ) {
    t = Math.min(1, (Date.now() - began) / duration)
    const k = easeInOut(t)
    await page.mouse.move(from.x + (x - from.x) * k, from.y + (y - from.y) * k)
    await page.waitForTimeout(8)
  }
  Object.assign(pointer, { x, y })
}

async function click(locator, after = 900) {
  await moveTo(locator)
  await pause(350)
  await page.mouse.down()
  await pause(110)
  await page.mouse.up()
  await pause(after)
}

async function type(locator, text) {
  await click(locator, 300)
  await locator.fill('')
  await locator.pressSequentially(text, { delay: 150 * PACE })
  await pause(600)
}

const mainNav = page.getByRole('navigation', { name: 'Principal' })
/** Desktop sidebar entries show the full label; the phone tab bar is labelled with the short name. */
const nav = (label, short = label) => (profile.touch ? mainNav.getByRole('button', { name: short, exact: true }) : mainNav.locator('button', { hasText: label }))
const methodEntry = () => (profile.touch ? page.getByRole('button', { name: 'Cómo se calcula' }) : nav('Cómo se calcula'))
/** Phones have much taller pages, so scrolls cover more ground. */
const far = (desktop, mobile) => (profile.touch ? mobile : desktop)

await page.goto(APP_URL)
await page.getByText('Tu plan empieza con tus datos').waitFor()
await page.evaluate(() => document.fonts.ready)
await page.mouse.move(pointer.x, pointer.y)
const stopRecording = await startRecorder(page)
await pause(1800)

// 1. Load the sample plan.
await click(page.getByRole('button', { name: 'Explorar con un ejemplo' }))
await click(page.getByRole('button', { name: 'Cargar ejemplo' }), 2000)

// 2. Overview.
await scroll(far(1100, 2200))
await pause(1200)
await scroll(-far(1100, 2200))

// 3. Day to day: log a spend.
await click(nav('Día a día'), 1500)
await type(page.locator('#quick-add-amount'), '12,50')
await click(page.getByRole('radiogroup', { name: 'Categoría' }).getByText('Ocio'))
await type(page.getByLabel('Concepto (opcional)'), 'Entradas de teatro')
await click(page.locator('form button[type="submit"]'), 2200)
await scroll(far(450, 700))
await pause(1200)

// 4. Income and expenses: add a recurring expense.
await click(nav('Ingresos y gastos', 'Presupuesto'), 1500)
await click(page.getByRole('button', { name: 'Añadir gasto' }))
await type(page.getByLabel('Nombre'), 'Gimnasio')
await type(page.getByLabel('Importe neto'), '35')
await click(page.getByRole('button', { name: 'Guardar gasto' }), 1500)
await scroll(far(700, 1200))
await pause(1000)

// 5. Portfolio.
await click(nav('Mi cartera', 'Cartera'), 1800)
await scroll(far(500, 900))
await pause(1000)

// 6. Projection: tweak the scenario.
await click(nav('Proyección'), 1500)
await type(page.getByLabel('Rentabilidad anual supuesta'), '7')
await type(page.getByLabel('Horizonte'), '25')
await page.keyboard.press('Tab')
await pause(2200)

// 7. Dark theme on the overview.
await click(nav('Resumen'), 1300)
await click(page.getByRole('button', { name: /^Tema:/ }))
await click(page.getByRole('button', { name: 'Oscuro' }), 1800)
await scroll(far(700, 1400))
await pause(1000)

// 8. How it is calculated.
await click(methodEntry(), 1500)
await scroll(far(900, 1600))
await pause(2000)

await stopRecording()
await browser.close()
await server.close()
console.log(`Demo video: ${OUTPUT}`)
