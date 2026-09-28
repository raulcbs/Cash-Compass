const moneyFormat = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const compactMoneyFormat = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const percentFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

export const money = (n: number) => moneyFormat.format(n)
export const wholeMoney = (n: number) => compactMoneyFormat.format(n)
export const percent = (n: number) => `${percentFormat.format(n)} %`
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
