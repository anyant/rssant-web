import _ from 'lodash'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'
import { isLaunchFromPWA } from '@/plugin/pwa'
import { reportEvent } from '@/plugin/metric'
import localFeeds from '@/plugin/localFeeds'
import localConfig from '@/plugin/localConfig'
import shopantClient from '@/plugin/shopant'

function isShopantEnable(state) {
  if (_.isNil(state.loginUser)) {
    return false
  }
  return _.defaultTo(state.loginUser.shopant_enable, false)
}

async function syncCustomerBalance(DAO) {
  if (!isShopantEnable(DAO.state)) {
    return
  }
  await shopantClient
    .call('customer.get', {
      customer: DAO.shopantCustomerParameter,
    })
    .then(customer => {
      DAO.SET_SHOPANT_CUSTOMER(customer)
    })
    .catch(ex => {
      // eslint-disable-next-line
      console.log(ex)
    })
}

function getBalance(state) {
  if (_.isNil(state.shopantCustomer)) {
    return null
  }
  let balance = state.shopantCustomer.balance
  return new Date(balance * 1000)
}

const NOW = Date.now()
const HOURS = 60 * 60 * 1000

function isBalanceEnough(state) {
  if (!isShopantEnable(state)) {
    return true
  }
  let balance = getBalance(state)
  if (_.isNil(balance)) {
    return true
  }
  return balance.getTime() - NOW > 24 * HOURS
}

async function logout() {
  localFeeds.clear()
  await API.user.logout()
}

async function safeLogout() {
  // try logout first to workaround django auth issues
  // need more investigation on root cause
  try {
    await logout()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`logout failed ${error}`)
  }
}

export default {
  state: {
    inputAccount: null,
    loading: new Loading(),
    loginUser: null,
    loginToken: null,
    loginDate: null,
    vipNoticedTimestamp: localConfig.VIP_NOTICED_TIMESTAMP.get(),
    shopantCustomer: null,
    shopantProductLoading: new Loading(),
    shopantProduct: null,
  },
  mutations: {
    SET_INPUT_ACCOUNT(state, value) {
      state.inputAccount = value
    },
    LOGIN(state, loginUser) {
      state.loginUser = loginUser
    },
    CONFIGURE_PASSWORD(state) {
      if (!_.isNil(state.loginUser)) {
        state.loginUser.has_usable_password = true
      }
    },
    UPDATE_VIP_NOTICED_TIMESTAMP(state) {
      let value = Math.floor(Date.now() / 1000)
      state.vipNoticedTimestamp = value
      localConfig.VIP_NOTICED_TIMESTAMP.set(value)
    },
    SET_SHOPANT_CUSTOMER(state, customer) {
      state.shopantCustomer = customer
    },
    SET_SHOPANT_PRODUCT(state, product) {
      state.shopantProduct = product
    },
  },
  getters: {
    inputAccount(state) {
      return state.inputAccount
    },
    isLoading(state) {
      return state.loading.isLoading
    },
    isLogined(state) {
      return !_.isNil(state.loginUser)
    },
    loginUser(state) {
      return state.loginUser
    },
    shouldNoticeVip(state) {
      if (isBalanceEnough(state)) {
        return false
      }
      let noticed = state.vipNoticedTimestamp
      return _.isNil(noticed) || NOW - noticed * 1000 > 16 * HOURS
    },
    isShopantEnable(state) {
      return isShopantEnable(state)
    },
    shopantCustomerParameter(state) {
      if (_.isNil(state.loginUser)) {
        return null
      }
      let user = state.loginUser
      return {
        external_id: user.id,
        nickname: user.username,
      }
    },
    shopantCustomer(state) {
      return state.shopantCustomer
    },
    balance(state) {
      return getBalance(state)
    },
    isBalanceEnough(state) {
      return isBalanceEnough(state)
    },
    shopantProduct(state) {
      return state.shopantProduct
    },
  },
  actions: {
    async login(DAO, { account, password } = {}) {
      if (!_.isNil(account)) {
        if (DAO.state.loading.isFinished) {
          DAO.state.loading.reset()
        }
      }
      await DAO.state.loading.begin(async () => {
        let user = await API.user.login({ account, password })
        DAO.LOGIN(user)
        localConfig.HAS_LOGIN_HISTORY.set(true)
        syncCustomerBalance(DAO)
        if (isLaunchFromPWA()) {
          reportEvent('LOGIN_PWA')
        }
      })
    },
    async syncCustomerBalance(DAO) {
      await syncCustomerBalance(DAO)
    },
    async syncProduct(DAO) {
      if (!_.isNil(DAO.state.shopantProduct)) {
        return
      }
      if (!isShopantEnable(DAO.state)) {
        return
      }
      await DAO.state.shopantProductLoading.begin(async () => {
        let product = await shopantClient.call('product.get')
        DAO.SET_SHOPANT_PRODUCT(product)
      })
    },
    async register(DAO, { username, email, password }) {
      await API.user.register({ username, email, password })
      reportEvent('REGISTER')
    },
    async confirmEmail(DAO, { key }) {
      await API.user.confirmEmail({ key })
    },
    async changePassword(DAO, { password }) {
      await API.user.changePassword({ password }).then(() => {
        DAO.CONFIGURE_PASSWORD()
      })
    },
    async resetPassword(DAO, { email }) {
      await API.user.resetPassword({ email })
    },
    async confirmResetPassword(DAO, { token, uid, new_password }) {
      await API.user.confirmResetPassword({ token, uid, new_password })
    },
    async logout(DAO) {
      await logout()
    },
    async safeLogout(DAO) {
      await safeLogout()
    },
    loginGithub(DAO, { next, scope } = {}) {
      API.user.loginGithub({ next, scope })
    },
    connectGithub(DAO, { next, scope } = {}) {
      if (!DAO.isLogined) {
        return
      }
      API.user.connectGithub({ next, scope })
    },
  },
}
