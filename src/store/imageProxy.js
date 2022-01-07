import _ from 'lodash'
import { API } from '@/plugin/api'
import { hamiVuex } from '@/store'
import { userStore } from '@/store/user'

export const imageProxyStore = hamiVuex.store({
  $name: 'image_proxy',
  $state() {
    return {
      _proxyUrl: null,
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
    return this.urlList.length > 0
  },
  pickProxyUrl() {
    if (this.isEnable && _.isNil(this._proxyUrl)) {
      let urlList = _.shuffle(this.urlList)
      let proxyUrl = urlList[0]
      if (proxyUrl === 'origin') {
        proxyUrl = window.location.origin
      }
      this.$patch({ _proxyUrl: proxyUrl })
    }
    return this._proxyUrl
  },
  urlForImage({ src, token }) {
    let proxyUrl = this.pickProxyUrl()
    if (_.isNil(proxyUrl) || _.isEmpty(token)) {
      return null
    }
    return API.imageProxy.urlForImage({ proxyUrl, src, token })
  },
})
