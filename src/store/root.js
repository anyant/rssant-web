export default {
    async syncFeedLoadMushrooms(API) {
        await API.feed.sync()
        let mushroomFeedIds = API.feed.mushroomFeedIds
        await API.story.loadMushrooms({ feedIds: mushroomFeedIds, days: 14 })
        API.story.sortMushrooms()
        await API.story.loadFavorited()
    }
}