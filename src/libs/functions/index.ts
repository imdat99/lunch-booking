export const formatMoney = (v?: string | number) => {
  const replateStr = String(v || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (replateStr) {
    return replateStr + 'K'
  }
  return ''
}
