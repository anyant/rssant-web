import API from '@/plugin/api'
import { hamiVuex } from '@/store'

export const publishConfigStore = hamiVuex.store({
  $name: 'publishConfig',
  $state: {
    isLoaded: false,
    config: {
      is_enable: false,
    },
  },
  get websiteTitle() {
    return this.config.website_title || 'RSS订阅'
  },
  async doLoad() {
    let result = await API.publish.info()
    this.$patch({ config: result, isLoaded: true })
  },
})
