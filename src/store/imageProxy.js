import _ from 'lodash'
import { API } from '@/plugin/api'
import Loading from '@/plugin/loading'
import { hamiVuex } from '@/store'
import { userStore } from '@/store/user'

export const imageProxyStore = hamiVuex.store({
  $name: 'image_proxy',
  $state() {
    return {
      _proxyUrl: null,
      _proxyError: false,
      _activeLoading: new Loading(),
    }
  },
  get urlList() {
    if (_.isNil(userStore.loginUser)) {
      return []
    }
    let image_proxy = userStore.loginUser.image_proxy
    if (_.isNil(image_proxy) || !image_proxy.enable) {
      return []
    }
    return image_proxy.url_s || []
  },
  get isEnable() {
    return this.urlList.length > 0 && !this._proxyError
  },
  async doActive(){
    if (!_.isNil(this._proxyUrl) || !this.isEnable) {
      return
    }
    await this._activeLoading.begin(async () => {
      let urlList = _.shuffle(this.urlList)
      let proxyUrl = urlList[0]
      if (proxyUrl === 'origin') {
        proxyUrl = window.location.origin
      }
      this.$patch({ _proxyUrl: proxyUrl })
      try {
        await API.imageProxy.active({ proxyUrl, userId: userStore.loginUser.id })
      } catch (err) {
        this.$patch({ _proxyError: true })
        // eslint-disable-next-line no-console
        console.warn(`Active image proxy failed: ${err.message}`)
      }
    })
  },
  async pickProxyUrl() {
    await this.doActive()
    if (this._proxyError) {
      return null
    }
    return this._proxyUrl
  },
  async urlForImage({ src, token }) {
    let proxyUrl = await this.pickProxyUrl()
    if (_.isNil(proxyUrl)) {
      return null
    }
    return API.imageProxy.urlForImage({ proxyUrl, src, token })
  },
})
