import _ from 'lodash'
import moment from 'moment'



/**
 * 10:35
 * 04-24 10:35
 * 2019-04-24
 */
function formatDate(date) {
    if (_.isNil(date) || _.isEmpty(date)) {
        return ''
    }
    date = moment(date)
    let now = moment()
    if (date.isSame(now, 'day')) {
        return date.format('HH:ss')
    } else if (date.isSame(now, 'year')) {
        return date.format('MM-DD HH:ss')
    } else {
        return date.format('YYYY-MM-DD')
    }
}


export { formatDate }
