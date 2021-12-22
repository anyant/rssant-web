import { hamiVuex, API as StoreAPI } from '.'
import { storyStore } from './story'

export const rootStore = hamiVuex.store({
  $name: 'root',
  async syncFeedLoadMushrooms() {
    await StoreAPI.feed.sync()
    let mushroomKeys = StoreAPI.feed.mushroomKeys
    await storyStore.loadMushrooms({ mushroomKeys })
  },
})
