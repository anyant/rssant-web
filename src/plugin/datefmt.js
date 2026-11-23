import _ from 'lodash'
import { isSameDay, format, isSameYear, addDays, differenceInDays } from 'date-fns'

export function formatDate(date) {
  return format(new Date(date), 'yyyy-MM-dd')
}

export function formatFullDate(date) {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
}

/**
 * 10:35
 * 昨天
 * 前天
 * 04-24
 * 2019-04
 */
export function formatDateFriendly(date, now) {
  if (_.isNil(date) || date === '') {
    return ''
  }
  date = new Date(date)
  if (_.isNil(now)) {
    now = new Date()
  }
  if (isSameDay(now, date)) {
    return format(date, 'HH:mm')
  } else if (isSameDay(now, addDays(date, 1))) {
    return format(date, '昨天')
  } else if (isSameDay(now, addDays(date, 2))) {
    return format(date, '前天')
  } else if (isSameYear(now, date)) {
    return format(date, 'MM-dd')
  } else {
    return format(date, 'yyyy-MM')
  }
}

export function formatUpdateTime(date, now) {
  if (_.isNil(date) || date === '') {
    return ''
  }
  date = new Date(date)
  if (_.isNil(now)) {
    now = new Date()
  }
  if (isSameDay(now, date)) {
    return '今天更新'
  } else if (isSameDay(now, addDays(date, 1))) {
    return '昨天更新'
  }
  let days = differenceInDays(now, date)
  if (days > 0 && days <= 30) {
    return `${days} 天前更新`
  }
  return format(date, 'MM-dd') + ' 更新'
}

export function formatFullDateFriendly(date) {
  if (_.isNil(date) || date === '') {
    return ''
  }
  date = new Date(date)
  let now = new Date()
  let dateStr = format(date, 'yyyy-MM-dd HH:mm:ss')
  if (isSameDay(now, date)) {
    dateStr = `${dateStr} 今天`
  } else if (isSameDay(now, addDays(date, 1))) {
    dateStr = `${dateStr} 昨天`
  } else {
    let days = differenceInDays(now, date)
    dateStr = `${dateStr} 约 ${days} 天前`
  }
  return dateStr
}
