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
  async deleteFeed({ feedId }) {
    return await feedStore.delete({ feedId, storyStore })
  },
  async deleteAllFeed({ feedIds = null } = {}) {
    return await feedStore.deleteAll({ feedIds, storyStore })
  },
})
