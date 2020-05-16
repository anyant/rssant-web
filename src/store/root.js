export default {
  async syncFeedLoadMushrooms(API) {
    await API.feed.sync()
    let mushroomKeys = API.feed.mushroomKeys
    await API.story.loadMushrooms({ mushroomKeys })
    API.story.sortMushrooms()
  },
}
