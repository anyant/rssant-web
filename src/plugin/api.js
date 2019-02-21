import Notification from './notify'
import Timeit from './timeit'

import * as lodash from 'lodash-es'
import axios from 'axios'

const BASE_URL = '/api'

const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.response.use(
  function (response) {
    if (window.app.debug) {
      let time = response.headers['x-time']
      if (!lodash.isNil(time)) {
        Timeit.show(time, response.config.url)
      }
    }
    return Promise.resolve(response.data)
  },
  function (error) {
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

const API = {
  user: {
    me() {
      return client.get('/user/me')
    }
  },
  feed: {
    list({ detail, cursor, size } = {}) {
      return client.get('/feed/', { detail, cursor, size })
    },
    create({ url }) {
      return client.post('/feed/', { url })
    },
    get({ id, detail }) {
      return client.get(`/feed/${id}`, { detail })
    },
    update({ id, url }) {
      return client.put(`/feed/${id}`, { url })
    },
    delete({ id }) {
      return client.delete(`/feed/${id}`)
    }
  },
  story: {
    list({ feed_id, detail, data, cursor, size } = {}) {
      return client.get('/story/', { feed_id, detail, data, cursor, size })
    },
    get({ id, detail, data }) {
      return client.get(`/story/${id}`, { detail, data })
    }
  }
}

export default API
export {
  API, BASE_URL, client
}
