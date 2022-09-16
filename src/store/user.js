import _ from 'lodash'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'
import { isLaunchFromPWA } from '@/plugin/pwa'
import { reportEvent } from '@/plugin/metric'
import localFeeds from '@/plugin/localFeeds'
import localConfig from '@/plugin/localConfig'
import { hamiVuex } from '.'
import { formatDate } from '@/plugin/datefmt'

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
      vipCustomer: null,
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
  SET_VIP_CUSTOMER(customer) {
    this.$patch({ vipCustomer: customer })
  },
  get isLoading() {
    return this.loading.isLoading
  },
  get isLogined() {
    return !_.isNil(this.loginUser)
  },
  get isVipEnable() {
    if (_.isNil(this.loginUser)) {
      return false
    }
    return _.defaultTo(this.loginUser.ezrevenue_enable, false)
  },
  get balance() {
    if (_.isNil(this.vipCustomer)) {
      return null
    }
    const equityId = this.loginUser.ezrevenue_vip_equity_id
    const balance_s = this.vipCustomer.balance_s
    return balance_s.find(x => x.equity_id === equityId)
  },
  get isBalanceUsable() {
    if (!this.isVipEnable || _.isNil(this.balance)) {
      return true
    }
    return this.balance.is_balance_usable
  },
  get balanceText() {
    const item = this.balance
    if (_.isNil(item)) {
      return '####-##-##'
    }
    if (item.is_balance_infinite) {
      return '9999-12-31'
    }
    return formatDate(item.balance * 1000)
  },
  get vipHomeLink() {
    if (_.isNil(this.vipCustomer)) {
      return null
    }
    return this.vipCustomer.home_link.url
  },
  get shouldNoticeVip() {
    if (!this.isBalanceUsable) {
      return true
    }
    if (_.isNil(this.balance)) {
      return false
    }
    const deadline = this.balance.balance * 1000
    return deadline - NOW < 48 * HOURS
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
      this.syncVipCustomer()
      if (isLaunchFromPWA()) {
        reportEvent('LOGIN_PWA')
      }
    })
  },
  async syncVipCustomer() {
    if (!this.isVipEnable) {
      return
    }
    await API.user
      .vipCustomerInfo()
      .then(customer => {
        this.SET_VIP_CUSTOMER(customer)
      })
      .catch(ex => {
        // eslint-disable-next-line
        console.log(ex)
      })
  },
  async openVipHomeLink() {
    const url = this.vipHomeLink
    if (!url) {
      return
    }
    const padTop = window.outerHeight - window.innerHeight
    const height = window.innerHeight - padTop
    const top = window.screenTop + padTop + 8
    let width = window.innerWidth - 16
    if (width > 800) {
      width = 800
    }
    const padLeft = Math.round((window.innerWidth - width) / 2)
    const left = window.screenLeft + padLeft
    const popupConfig = `popup,width=${width},height=${height},left=${left},top=${top}`
    const popup = window.open(url, '', popupConfig)
    await new Promise(resolve => {
      const popupTick = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupTick)
          resolve(true)
        }
      }, 1000)
    })
    await this.syncVipCustomer()
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
