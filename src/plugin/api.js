import _ from 'lodash'
import axios from 'axios'
import Cookies from 'js-cookie'
import Toast from 'muse-ui-toast'

import Timeit from './timeit'
import localConfig from './localConfig'

function isDebug() {
  return localConfig.DEBUG.get()
}

const BASE_URL = '/api/v1'

function urlFor(path, query, origin) {
  if (_.isNil(origin)) {
    origin = window.location.origin
  }
  let url = new URL(path, origin)
  let search = new URLSearchParams()
  _.forEach(_.entries(query), ([key, value]) => {
    if (!_.isNil(value)) {
      search.append(key, value)
    }
  })
  url.search = search
  return url.toString()
}

const client = axios.create({
  baseURL: BASE_URL,
})

const REQUEST_ITERCEPTORS = [
  function(config) {
    let csrftoken = Cookies.get('csrftoken')
    if (!_.isNil(csrftoken)) {
      if (_.isNil(config.headers)) {
        config.headers = {}
      }
      config.headers['X-CSRFToken'] = csrftoken
    }
    return config
  },
]
REQUEST_ITERCEPTORS.forEach(x => {
  client.interceptors.request.use(x)
})

const RESPONSE_INTERCEPTORS = [
  [
    function(response) {
      if (isDebug()) {
        let time = response.headers['x-time']
        if (!_.isNil(time)) {
          Timeit.show(time, response.config.method, response.config.url)
        }
      }
      return Promise.resolve(response.data)
    },
    function(error) {
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
      if (isDebug()) {
        Toast.error(title + ': ' + message)
      }
      return Promise.reject(error)
    },
  ],
]
RESPONSE_INTERCEPTORS.forEach(pair => {
  client.interceptors.response.use(...pair)
})

function convertDjangoErrorMessage(error, fields) {
  if (!error.response || error.response.status !== 400) {
    return error.message
  }
  let data = error.response.data
  let message = []
  for (let field of fields) {
    if (_.isArray(data[field])) {
      message = message.concat(data[field])
    } else if (!_.isEmpty(data[field])) {
      message.push(data[field])
    }
  }
  message = message.slice(0, 1).join(' ')
  return message
}

function convertEmailMessage(emailMessage) {
  if (!_.isEmpty(emailMessage)) {
    if (emailMessage.toLowerCase().includes('already registered')) {
      emailMessage = '此邮箱已注册'
    } else if (emailMessage.toLowerCase().includes('valid email address')) {
      emailMessage = '邮箱地址无效'
    }
  }
  return emailMessage
}

function convertPasswordMessage(passwordMessage) {
  if (!_.isEmpty(passwordMessage)) {
    if (passwordMessage.toLowerCase().includes('password is too short')) {
      passwordMessage = '密码至少要 8 个字符'
    } else if (passwordMessage.toLowerCase().includes('password is too common')) {
      passwordMessage = '密码不能太简单'
    } else if (passwordMessage.toLowerCase().includes('password is too similar to the username')) {
      passwordMessage = '密码不能和用户名太相似'
    }
  }
  return passwordMessage
}

const API = {
  user: {
    login({ account, password } = {}) {
      return client.post('/user/login/', { account, password })
    },
    register({ username, email, password }) {
      username = _.defaultTo(username, email)
      return client
        .post('/auth/registration/', {
          username,
          email,
          password1: password,
          password2: password,
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            let emailMessage = convertDjangoErrorMessage(error, ['email', 'username'])
            emailMessage = convertEmailMessage(emailMessage)
            let passwordMessage = convertDjangoErrorMessage(error, ['password1', 'password2'])
            passwordMessage = convertPasswordMessage(passwordMessage)
            error.response.data = {
              email: emailMessage,
              password: passwordMessage,
            }
          }
          throw error
        })
    },
    vipCustomerInfo() {
      return client.post('/ezrevenue/customer.info')
    },
    confirmEmail({ key }) {
      return client.post('/auth/registration/verify-email/', { key })
    },
    changePassword({ password }) {
      return client
        .post('/auth/password/change/', { new_password1: password, new_password2: password })
        .catch(error => {
          let passwordMessage = convertDjangoErrorMessage(error, ['new_password1', 'new_password2'])
          passwordMessage = convertPasswordMessage(passwordMessage)
          if (!_.isEmpty(passwordMessage)) {
            error.message = passwordMessage
          }
          throw error
        })
    },
    resetPassword({ email }) {
      return client.post('/auth/password/reset/', { email }).catch(error => {
        let emailMessage = convertDjangoErrorMessage(error, ['email'])
        emailMessage = convertEmailMessage(emailMessage)
        if (!_.isEmpty(emailMessage)) {
          error.message = emailMessage
        }
        throw error
      })
    },
    confirmResetPassword({ token, uid, new_password }) {
      return client
        .post('/auth/password/reset/confirm/', {
          token,
          uid,
          new_password1: new_password,
          new_password2: new_password,
        })
        .catch(error => {
          let passwordMessage = convertDjangoErrorMessage(error, ['new_password1', 'new_password2', 'token', 'uid'])
          passwordMessage = convertPasswordMessage(passwordMessage)
          if (!_.isEmpty(passwordMessage)) {
            error.message = passwordMessage
          }
          throw error
        })
    },
    logout() {
      return client.post(`/auth/logout/`)
    },
    loginGithub({ next, scope } = {}) {
      let path = BASE_URL + '/accounts/github/login/'
      let url = urlFor(path, { next, scope, process: 'login' })
      window.location.assign(url)
    },
    connectGithub({ next, scope } = {}) {
      let path = BASE_URL + '/accounts/github/login/'
      let url = urlFor(path, { next, scope, process: 'connect' })
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
    setTitle({ id, title }) {
      return client.put(`/feed/set-title`, { id, title })
    },
    setPublish({ id, is_publish }) {
      return client.put(`/feed/set-publish`, { id, is_publish })
    },
    setAllGroup({ ids, group }) {
      return client.put(`/feed/set-all-group`, { ids, group })
    },
    delete({ id }) {
      return client.delete(`/feed/${id}`)
    },
    deleteAll({ ids = null } = {}) {
      return client.post(`/feed/all/delete`, { ids })
    },
    setStoryOffset({ id, offset }) {
      return client.put(`/feed/${id}/offset`, { offset })
    },
    setAllReaded({ ids } = {}) {
      return client.put(`/feed/all/readed`, { ids })
    },
    import({ text, group }) {
      return client.post('/feed/import', { text, group })
    },
    importFile({ file, group }) {
      var formData = new FormData()
      formData.append('file', file)
      return client.post(`/feed/import/file`, formData, {
        params: { group },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    queryBatch({ storys, detail }) {
      return client.post('/story/query-batch', { storys, detail })
    },
    get({ feed_id, offset, detail, set_readed }) {
      return client.get(`/story/${feed_id}-${offset}`, { params: { detail, set_readed } })
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
    },
    fetchFulltext({ feed_id, offset }) {
      return client.post('/story/fetch-fulltext', { feed_id, offset })
    },
  },
  userPublish: {
    get() {
      return client.post('/user_publish.get', {})
    },
    set({ unionid, is_enable, root_url, is_all_public }) {
      return client.post('/user_publish.set', { unionid, is_enable, root_url, is_all_public })
    },
  },
  publish: {
    info() {
      return client.post('/publish.info', {})
    },
    feedQuery({ detail, hints } = {}) {
      return client.post('/publish.feed_query', { detail, hints })
    },
    feedGet({ id, detail }) {
      return client.post(`/publish.feed_get`, { id, detail })
    },
    storyQuery({ feed_id, detail, offset, size } = {}) {
      return client.post('/publish.story_query', { feed_id, detail, offset, size })
    },
    storyGet({ feed_id, offset, detail, set_readed }) {
      return client.post(`/publish.story_get`, { feed_id, offset, detail, set_readed })
    },
  },
  imageProxy: {
    urlForImage({ proxyUrl, src, token }) {
      let path = '/api/v1/image/proxy'
      return urlFor(path, { url: src, token: token }, proxyUrl)
    },
  },
}

export default API
export { API, BASE_URL, REQUEST_ITERCEPTORS, client }
