import _ from 'lodash'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'
import { isLaunchFromPWA } from '@/plugin/pwa'
import { reportEvent } from '@/plugin/metric'
import localFeeds from '@/plugin/localFeeds'
import localConfig from '@/plugin/localConfig'
import shopantClient from '@/plugin/shopant'
import { hamiVuex } from '.'

const NOW = Date.now()
const HOURS = 60 * 60 * 1000

export const userStore = hamiVuex.store({
  $name: 'user',
  $state() {
    return {
      inputAccount: null,
      loading: new Loading(),
      loginUser: null,
      loginToken: null,
      loginDate: null,
      vipNoticedTimestamp: localConfig.VIP_NOTICED_TIMESTAMP.get(),
      shopantCustomer: null,
      shopantProductLoading: new Loading(),
      shopantProduct: null,
    }
  },
  SET_INPUT_ACCOUNT(value) {
    this.$patch({ inputAccount: value })
  },
  LOGIN(loginUser) {
    this.$patch({ loginUser: loginUser })
  },
  CONFIGURE_PASSWORD() {
    if (!_.isNil(this.loginUser)) {
      this.$patch(state => {
        state.loginUser.has_usable_password = true
      })
    }
  },
  UPDATE_VIP_NOTICED_TIMESTAMP() {
    let value = Math.floor(Date.now() / 1000)
    this.$patch({ vipNoticedTimestamp: value })
    localConfig.VIP_NOTICED_TIMESTAMP.set(value)
  },
  SET_SHOPANT_CUSTOMER(customer) {
    this.$patch({ shopantCustomer: customer })
  },
  SET_SHOPANT_PRODUCT(product) {
    this.$patch({ shopantProduct: product })
  },
  get isLoading() {
    return this.loading.isLoading
  },
  get isLogined() {
    return !_.isNil(this.loginUser)
  },
  get shouldNoticeVip() {
    if (this.isBalanceEnough) {
      return false
    }
    let noticed = this.vipNoticedTimestamp
    return _.isNil(noticed) || NOW - noticed * 1000 > 16 * HOURS
  },
  get isShopantEnable() {
    if (_.isNil(this.loginUser)) {
      return false
    }
    return _.defaultTo(this.loginUser.shopant_enable, false)
  },
  get shopantCustomerParameter() {
    if (_.isNil(this.loginUser)) {
      return null
    }
    let user = this.loginUser
    return {
      external_id: user.id,
      nickname: user.username,
    }
  },
  get balance() {
    if (_.isNil(this.shopantCustomer)) {
      return null
    }
    let balance = this.shopantCustomer.balance
    return new Date(balance * 1000)
  },
  get isBalanceEnough() {
    if (!this.isShopantEnable) {
      return true
    }
    let balance = this.balance
    if (_.isNil(balance)) {
      return true
    }
    return balance.getTime() - NOW > 24 * HOURS
  },
  async login({ account, password } = {}) {
    if (!_.isNil(account)) {
      if (this.loading.isFinished) {
        this.loading.reset()
      }
    }
    await this.loading.begin(async () => {
      let user = await API.user.login({ account, password })
      this.LOGIN(user)
      localConfig.HAS_LOGIN_HISTORY.set(true)
      this.syncCustomerBalance()
      if (isLaunchFromPWA()) {
        reportEvent('LOGIN_PWA')
      }
    })
  },
  async syncCustomerBalance() {
    if (!this.isShopantEnable) {
      return
    }
    await shopantClient
      .call('customer.get', {
        customer: this.shopantCustomerParameter,
      })
      .then(customer => {
        this.SET_SHOPANT_CUSTOMER(customer)
      })
      .catch(ex => {
        // eslint-disable-next-line
        console.log(ex)
      })
  },
  async syncProduct() {
    if (!_.isNil(this.shopantProduct)) {
      return
    }
    if (!this.isShopantEnable) {
      return
    }
    await this.shopantProductLoading.begin(async () => {
      let product = await shopantClient.call('product.get')
      this.SET_SHOPANT_PRODUCT(product)
    })
  },
  async register({ username, email, password }) {
    await API.user.register({ username, email, password })
    reportEvent('REGISTER')
  },
  async confirmEmail({ key }) {
    await API.user.confirmEmail({ key })
  },
  async changePassword({ password }) {
    await API.user.changePassword({ password }).then(() => {
      this.CONFIGURE_PASSWORD()
    })
  },
  async resetPassword({ email }) {
    await API.user.resetPassword({ email })
  },
  async confirmResetPassword({ token, uid, new_password }) {
    await API.user.confirmResetPassword({ token, uid, new_password })
  },
  async logout() {
    localFeeds.clear()
    await API.user.logout()
  },
  async safeLogout() {
    // try logout first to workaround django auth issues
    // need more investigation on root cause
    try {
      await this.logout()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`logout failed ${error}`)
    }
  },
  loginGithub({ next, scope } = {}) {
    API.user.loginGithub({ next, scope })
  },
  connectGithub({ next, scope } = {}) {
    if (!this.isLogined) {
      return
    }
    API.user.connectGithub({ next, scope })
  },
})
