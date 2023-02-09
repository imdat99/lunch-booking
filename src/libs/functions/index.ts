export const formatMoney = (v?: string | number, isShowUnit = true) => {
  const replaceStr = String(v || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (replaceStr) {
    return replaceStr
  }
  return isShowUnit && '0'
}
