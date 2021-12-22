import { hamiVuex } from '.'
import { feedStore } from './feed'
import { storyStore } from './story'

export const rootStore = hamiVuex.store({
  $name: 'root',
  async syncFeedLoadMushrooms() {
    await feedStore.sync()
    let mushroomKeys = feedStore.mushroomKeys
    await storyStore.loadMushrooms({ mushroomKeys })
  },
})
