import _ from 'lodash'
import datefn from 'date-fns'
import moment from 'moment'


/**
 * 10:35
 * 04-24 10:35
 * 2019-04-24
 */
export function formatDate(date, now) {
    if (_.isNil(date) || _.isEmpty(date)) {
        return ''
    }
    date = new Date(date)
    if (_.isNil(now)) {
        now = new Date()
    }
    if (datefn.isSameDay(now, date)) {
        return datefn.format(date, 'HH:ss')
    } else if (datefn.isSameDay(now, datefn.addDays(date, 1))) {
        return datefn.format(date, '昨天HH:ss')
    } else if (datefn.isSameDay(now, datefn.addDays(date, 2))) {
        return datefn.format(date, '前天HH:ss')
    } else if (datefn.isSameYear(now, date)) {
        return datefn.format(date, 'MM-DD HH:ss')
    } else {
        return datefn.format(date, 'YYYY-MM-DD')
    }
}


export function formatFullDate(date) {
    if (_.isNil(date) || _.isEmpty(date)) {
        return ''
    }
    date = moment(date)
    let dateStr = date.format('YYYY-MM-DD HH:mm')
    let dateAgo = date.fromNow()
    return `${dateStr} 约 ${dateAgo}`
}


