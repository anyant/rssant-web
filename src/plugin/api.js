import Notification from './notify'
import Timeit from './timeit'

import _ from 'lodash'
import axios from 'axios'
import Cookies from 'js-cookie'
import URI from 'urijs'

const BASE_URL = '/api/v1'

const client = axios.create({
  baseURL: BASE_URL,
})

client.interceptors.request.use(function (config) {
  let csrftoken = Cookies.get('csrftoken')
  if (!_.isNil(csrftoken)) {
    if (_.isNil(config.headers)) {
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
      if (!_.isNil(time)) {
        Timeit.show(time, response.config.method, response.config.url)
      }
    }
    return Promise.resolve(response.data)
  },
  function (error) {
    let title = null
    if (_.isNil(error.response)) {
      title = `Failed: ${error.config.method} ${error.config.url}`
    } else {
      title = `${error.response.status} ${error.response.statusText}`
    }
    let message = error.message
    if (!_.isNil(error.response)) {
      if (!_.isNil(error.response.data)) {
        if (!_.isEmpty(error.response.data.message)) {
          message = error.response.data.message
        }
      }
    }
    message = _.truncate(message, { length: 50, separator: /,? +/ })
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
      username = _.defaultTo(username, email)
      return client.post('/auth/registration/', { username, email, password1: password, password2: password })
    },
    logout({ next } = {}) {
      return client.post(`/auth/logout/`).then(() => {
        window.location.assign(_.defaultTo(next, '/'))
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
    query({ detail, hints } = {}) {
      return client.post('/feed/query', { detail, hints })
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
    setReaded({ id, offset }) {
      return client.put(`/feed/${id}/readed`, { offset })
    },
    setAllReaded({ ids } = {}) {
      return client.put(`/feed/all/readed`, { ids })
    },
    importOPML({ file }) {
      var formData = new FormData()
      formData.append("file", file)
      return client.post(`/feed/opml`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    exportOPML({ download } = {}) {
      return client.get(`/feed/opml`, { params: { download } })
    },
    importBookmark({ file }) {
      var formData = new FormData()
      formData.append("file", file)
      return client.post(`/feed/bookmark`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
  },
  story: {
    query({ feed_id, detail, offset, size } = {}) {
      return client.get('/story/query', { params: { feed_id, detail, offset, size } })
    },
    get({ feed_id, offset, detail }) {
      return client.get(`/story/${feed_id}:${offset}`, { params: { detail } })
    },
    listWatched({ detail } = {}) {
      return client.get('/story/watched', { params: { detail } })
    },
    listFavorited({ detail } = {}) {
      return client.get('/story/favorited', { params: { detail } })
    },
    setWatched({ feed_id, offset, is_watched }) {
      return client.put(`/story/${feed_id}:${offset}/watched`, { is_watched })
    },
    setFavorited({ feed_id, offset, is_favorited }) {
      return client.put(`/story/${feed_id}:${offset}/favorited`, { is_favorited })
    }
  }
}

export default API
export {
  API, BASE_URL, client
}
