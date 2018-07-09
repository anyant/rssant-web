import {
  Notification
} from 'element-ui'

// fix Notification is native function
const ELNotification = Notification

// 使用 element-ui 的 Notification 组件，修改 offset 默认值，使其不遮挡 Header
function _patch(origin) {
  return options => {
    if (typeof options === 'object') {
      options.offset = options.offset || 64
    } else {
      options = {
        offset: 64,
        message: options
      }
    }
    return origin(options)
  }
}
let AntNotification = _patch(ELNotification)
for (let attr of ['success', 'warning', 'info', 'error']) {
  AntNotification[attr] = _patch(ELNotification[attr])
}
AntNotification.close = ELNotification.close

export {
  AntNotification as Notification
}
