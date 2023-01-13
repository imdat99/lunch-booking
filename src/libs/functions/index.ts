export const formatMoney = (v?: string | number, isShowUnit = true) => {
  const replateStr = String(v || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (replateStr) {
    return isShowUnit ? replateStr + ' K VND' : replateStr
  }
  return isShowUnit ? '0K' : '0'
}
