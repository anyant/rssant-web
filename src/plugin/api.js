import { WeirbClient } from 'weirb-client'
import Notification from './notify'
import Timeit from './timeit'

import * as lodash from 'lodash-es'

const api = new WeirbClient('/api')

api.interceptors.response.use(
  function(response) {
    if (window.app.debug) {
      let time = response.headers['x-timeit']
      if (!lodash.isNil(time)) {
        Timeit.show(time, response.config.url)
      }
    }
    return Promise.resolve(response)
  },
  function(error) {
    if (window.app.debug) {
      let title = error.code
      if (lodash.isNil(title)) {
        if (lodash.isNil(error.response)) {
          title = `Failed: ${error.config.method} ${error.config.url}`
        } else {
          title = `${error.response.status} ${error.response.statusText}`
        }
      }
      let message = lodash.truncate(error.message, {
        length: 50,
        separator: /,? +/
      })
      Notification.error({
        title: title,
        message: message
      })
    }
    return Promise.reject(error)
  }
)

export default api
