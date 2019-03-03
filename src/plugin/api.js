import Notification from './notify'
import Timeit from './timeit'

import lodash from 'lodash'
import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = '/api/v1'

const client = axios.create({
  baseURL: BASE_URL,
})

client.interceptors.request.use(function (config) {
  let csrftoken = Cookies.get('csrftoken')
  if (!lodash.isNil(csrftoken)) {
    if (lodash.isNil(config.headers)) {
      config.headers = {}
    }
    config.headers['X-CSRFToken'] = csrftoken
  }
  return config
})

client.interceptors.response.use(
  function (response) {
    if (window.app.debug) {
      let time = response.headers['x-time']
      if (!lodash.isNil(time)) {
        Timeit.show(time, response.config.method, response.config.url)
      }
    }
    return Promise.resolve(response.data)
  },
  function (error) {
    let title = null
    if (lodash.isNil(error.response)) {
      title = `Failed: ${error.config.method} ${error.config.url}`
    } else {
      title = `${error.response.status} ${error.response.statusText}`
    }
    let message = error.message
    if (!lodash.isNil(error.response)) {
      if (!lodash.isNil(error.response.data)) {
        if (!lodash.isEmpty(error.response.data.message)) {
          message = error.response.data.message
        }
      }
    }
    message = lodash.truncate(message, { length: 50, separator: /,? +/ })
    Object.assign(error, { title, message })
    if (window.app.debug) {
      Notification.error({ title, message })
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
      return client.get('/feed/', { params: { detail, cursor, size } })
    },
    create({ url }) {
      return client.post('/feed/', { url })
    },
    get({ id, detail }) {
      return client.get(`/feed/${id}`, { params: { detail } })
    },
    update({ id, title }) {
      return client.put(`/feed/${id}`, { title })
    },
    delete({ id }) {
      return client.delete(`/feed/${id}`)
    }
  },
  story: {
    list({ feed_id, detail, data, cursor, size } = {}) {
      return client.get('/story/', { params: { feed_id, detail, data, cursor, size } })
    },
    get({ id, detail, data }) {
      return client.get(`/story/${id}`, { params: { detail, data } })
    },
    setReaded({ id, is_readed }) {
      return client.put(`/story/${id}/readed`, { params: { is_readed } })
    },
    setFavorited({ id, is_favorited }) {
      return client.put(`/story/${id}/favorited`, { params: { is_favorited } })
    }
  }
}

export default API
export {
  API, BASE_URL, client
}
