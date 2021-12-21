import { hamiVuex, API as StoreAPI } from '.'
import { storyStore } from './story'

export const rootStore = hamiVuex.store({
  $name: 'root',
  async syncFeedLoadMushrooms(API) {
    await StoreAPI.feed.sync()
    let mushroomKeys = API.feed.mushroomKeys
    await storyStore.loadMushrooms({ mushroomKeys })
  },
})
