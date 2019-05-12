export default {
    async syncFeedLoadMushrooms(API) {
        await API.feed.sync()
        let mushroomFeedIds = API.feed.recentGarden.map(feed => feed.id)
        await API.story.loadMushrooms({ feedIds: mushroomFeedIds, days: 14 })
        API.story.sortMushrooms()
    }
}