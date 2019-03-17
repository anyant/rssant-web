import Notification from './notify'
import Timeit from './timeit'

import lodash from 'lodash'
import axios from 'axios'
import Cookies from 'js-cookie'
import URI from 'urijs'

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
    login({ account, password } = {}) {
      return client.post('/user/login/', { account, password })
    },
    register({ username, email, password }) {
      username = lodash.defaultTo(username, email)
      return client.post('/auth/registration/', { username, email, password1: password, password2: password })
    },
    logout({ next } = {}) {
      return client.post(`/auth/logout/`).then(() => {
        window.location.assign(lodash.defaultTo(next, '/'))
      })
    },
    loginGithub({ next, scope } = {}) {
      let url = URI(BASE_URL + '/accounts/github/login/')
        .search({ next, scope, process: 'login' })
      window.location.assign(url)
    },
    connectGithub({ next, scope } = {}) {
      let url = URI(BASE_URL + '/accounts/github/login/')
        .search({ next, scope, process: 'connect' })
      window.location.assign(url)
    },
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
    },
    setReaded({ id }) {
      return client.put(`/feed/${id}/readed`)
    },
  },
  story: {
    list({ feed_id, detail, data, cursor, size } = {}) {
      return client.get('/story/', { params: { feed_id, detail, data, cursor, size } })
    },
    get({ id, detail, data }) {
      return client.get(`/story/${id}`, { params: { detail, data } })
    },
    setReaded({ id, is_readed }) {
      return client.put(`/story/${id}/readed`, { is_readed })
    },
    setAllReaded() {
      return client.put(`/story/all/readed`)
    },
    setFavorited({ id, is_favorited }) {
      return client.put(`/story/${id}/favorited`, { is_favorited })
    }
  }
}

export default API
export {
  API, BASE_URL, client
}
