import dayjs from 'dayjs'

import { FORMAT__DATE } from '../constant'

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
    return dayjs(date * 1000).format(formatDate ?? FORMAT__DATE)
  }
  return dayjs(date).format(formatDate ?? FORMAT__DATE)
}
