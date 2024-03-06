import { hamiVuex } from '@/store'
import { API } from '@/plugin/api'
import _ from 'lodash'

export const userPublishStore = hamiVuex.store({
  $name: 'userPublish',
  $state() {
    return {
      config: {
        unionid: null,
        is_enable: false,
        is_all_public: false,
        root_url: null,
        website_title: null,
      },
    }
  },
  async doLoad() {
    let res = await API.userPublish.get()
    this.$patch({ config: res })
  },
  async doSave(config) {
    let data = { ...this.config }
    for (let k in config) {
      if (!_.isNil(config[k])) {
        data[k] = config[k]
      }
    }
    let res = await API.userPublish.set(data)
    this.$patch({ config: res })
  },
})
