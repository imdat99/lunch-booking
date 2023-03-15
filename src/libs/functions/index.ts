import dayjs from 'dayjs'

const FORMAT_DATE = 'DD/MM/YYYY'

export const formatMoney = (v?: string | number, isShowUnit = true) => {
  const replaceStr = String(v || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (replaceStr) {
    return replaceStr
  }
  return isShowUnit && '0'
}

export const formatDate = (date: dayjs.ConfigType, formatDate?: string) => {
  if (!date) {
    return ''
  }

  if (typeof date === 'number') {
    return dayjs(date * 1000).format(formatDate ?? FORMAT_DATE)
  }
  return dayjs(date).format(formatDate ?? FORMAT_DATE)
}
