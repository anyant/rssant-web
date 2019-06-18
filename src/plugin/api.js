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
        } else if (!_.isEmpty(error.response.data.detail)) {
          message = error.response.data.detail
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


function convertDjangoErrorMessage(error, fields) {
  if (!error.response || error.response.status !== 400) {
    return error.message
  }
  let data = error.response.data
  let message = []
  for (let field of fields) {
    if (_.isArray(data[field])) {
      message = message.concat(data[field])
    } else if (_.isEmpty(data[field])) {
      message.push(data[field])
    }
  }
  message = message.slice(0, 1).join(' ')
  return message
}


const API = {
  user: {
    login({ account, password } = {}) {
      return client.post('/user/login/', { account, password })
    },
    register({ username, email, password }) {
      username = _.defaultTo(username, email)
      return client.post('/auth/registration/', {
        username, email,
        password1: password,
        password2: password
      }).catch(error => {
        if (error.response && error.response.status === 400) {
          let emailMessage = convertDjangoErrorMessage(error, ['email', 'username'])
          let passwordMessage = convertDjangoErrorMessage(error, ['password1', 'password2'])
          error.response.data = {
            email: emailMessage,
            password: passwordMessage,
          }
        }
        throw error
      })
    },
    confirmEmail({ key }) {
      return client.post('/auth/registration/verify-email/', { key })
    },
    changePassword({ password }) {
      return client.post('/auth/password/change/', { password1: password, password2: password })
    },
    resetPassword({ email }) {
      return client.post('/auth/password/reset/', { email }).catch(error => {
        error.message = convertDjangoErrorMessage(error, ['email'])
        throw error
      })
    },
    confirmResetPassword({ token, uid, new_password }) {
      return client.post('/auth/password/reset/confirm/', {
        token, uid, new_password1: new_password, new_password2: new_password
      }).catch(error => {
        error.message = convertDjangoErrorMessage(error, ['new_password1', 'new_password2', 'token', 'uid'])
        throw error
      })
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
    getCreation({ id, detail }) {
      return client.get(`/feed/creation/${id}`, { params: { detail } })
    },
    queryCreationList({ detail } = {}) {
      return client.get('/feed/creation', { params: { detail } })
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
    setStoryOffset({ id, offset }) {
      return client.put(`/feed/${id}/offset`, { offset })
    },
    setAllReaded({ ids } = {}) {
      return client.put(`/feed/all/readed`, { ids })
    },
    import({ text }) {
      return client.post('/feed/import', { text })
    },
    importFile({ file }) {
      var formData = new FormData()
      formData.append("file", file)
      return client.post(`/feed/import/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    exportOPML({ download } = {}) {
      download = download ? 'true' : 'false'
      window.open(BASE_URL + `/feed/export/opml?download=${download}`, '_blank')
    },
  },
  story: {
    query({ feed_id, detail, offset, size } = {}) {
      return client.get('/story/query', { params: { feed_id, detail, offset, size } })
    },
    queryRecent({ feed_ids, days, detail } = {}) {
      return client.post('/story/recent', { feed_ids, days, detail })
    },
    get({ feed_id, offset, detail }) {
      return client.get(`/story/${feed_id}-${offset}`, { params: { detail } })
    },
    listWatched({ detail } = {}) {
      return client.get('/story/watched', { params: { detail } })
    },
    listFavorited({ detail } = {}) {
      return client.get('/story/favorited', { params: { detail } })
    },
    setWatched({ feed_id, offset, is_watched }) {
      return client.put(`/story/${feed_id}-${offset}/watched`, { is_watched })
    },
    setFavorited({ feed_id, offset, is_favorited }) {
      return client.put(`/story/${feed_id}-${offset}/favorited`, { is_favorited })
    }
  }
}

export default API
export {
  API, BASE_URL, client
}
