import api from '@/plugin/api'
import * as lodash from 'lodash-es'
import * as Cookies from 'js-cookie'

const TOKEN_COOKIE = 'guard_token'

const state = {
  loginUser: null,
  loginDate: null,
  loginToken: null,
  loginLoading: false
}

const getters = {
  isLogin(state) {
    return !lodash.isNil(state.loginUser)
  },
  loginLoading(state) {
    return state.loginLoading
  },
  currentUser(state) {
    return state.loginUser
  },
  shouldCheckLogin(state, getters) {
    if (getters.loginLoading || getters.isLogin) {
      return false
    }
    if (Cookies.get(TOKEN_COOKIE) == null) {
      return false
    }
    let now = new Date()
    if (now - state.loginDate > 30 * 1000 * 1000) {
      return true
    }
    return false
  }
}

const mutations = {
  setLoginLoading(state, loginLoading) {
    state.loginLoading = loginLoading
  },
  login(state, { user, token }) {
    state.loginUser = user
    state.loginToken = token
    state.loginDate = new Date()
  },
  logout(state) {
    Cookies.remove(TOKEN_COOKIE, {
      path: '/'
    })
    state.loginToken = null
  }
}

const actions = {
  async autoLogin({ commit, getters }) {
    if (getters.isLogin) {
      return
    }
    let user = null
    commit('setLoginLoading', true)
    try {
      user = await api.call('/login/me')
    } catch (e) {
      if (e.code !== 'Guard.Forbidden') {
        throw e
      }
    } finally {
      commit('setLoginLoading', false)
    }
    let token = Cookies.get(TOKEN_COOKIE)
    commit('login', {
      user,
      token
    })
  },
  async login({ commit, getters }, redirectUrl) {
    if (getters.isLogin) {
      return
    }
    if (lodash.isNil(redirectUrl)) {
      redirectUrl = '/'
    }
    commit('setLoginLoading', true)
    location.assign(`/api/login/github?state=${redirectUrl}`)
  },
  async logout({ commit }) {
    commit('logout')
    location.assign('/')
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
