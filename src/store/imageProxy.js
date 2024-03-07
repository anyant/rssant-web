import _ from 'lodash'
import { API } from '@/plugin/api'
import { hamiVuex } from '@/store'
import { userStore } from '@/store/user'
import { publishConfigStore } from '@/publish/store/config'

export const imageProxyStore = hamiVuex.store({
  $name: 'image_proxy',
  $state() {
    return {
      _proxyUrl: null,
    }
  },
  get urlList() {
    let imageProxy = userStore.imageProxy
    if (_.isNil(imageProxy)) {
      imageProxy = publishConfigStore.imageProxy
    }
    if (_.isNil(imageProxy) || !imageProxy.enable) {
      return []
    }
    return imageProxy.url_s || []
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
