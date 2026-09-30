import '@fontsource-variable/funnel-display/wght.css'
import '@fontsource-variable/funnel-sans/wght.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './ui/app/app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
