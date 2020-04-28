import _ from 'lodash'
import Vue from 'vue'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'


function sortMushrooms(mushrooms, API) {
    return _.chain(mushrooms)
        .sortBy([
            function (x) { return !API.story.isReaded(x) },
            function (x) { return new Date(x.dt_published) },
            function (x) { return x.feed.id },
            'offset'
        ])
        .value()
}


function addOrUpdateList(state, storys) {
    storys.forEach(story => {
        let feedStorys = state.storys[story.feed.id]
        if (_.isNil(feedStorys)) {
            Vue.set(state.storys, story.feed.id, {})
            feedStorys = state.storys[story.feed.id]
        }
        addOrUpdateStory(feedStorys, story)
    })
}


function addOrUpdateStory(feedStorys, story) {
    let old = feedStorys[story.offset]
    if (_.isNil(old) || !_.isEmpty(story.content)) {
        Vue.set(feedStorys, story.offset, story)
    }
}


export default {
    state: {
        storys: {},
        mushroomsSorted: false,
        mushrooms: [],
        mushroomsLoading: new Loading(),
        favoritedLoading: new Loading(),
    },
    mutations: {
        SET_FAVORITED(state, { feed_id, offset, is_favorited }) {
            state.storys[feed_id][offset].is_favorited = is_favorited;
        },
        SET_WATCHED(state, { feed_id, offset, is_watched }) {
            state.storys[feed_id][offset].is_watched = is_watched;
        },
        ADD_OR_UPDATE(state, story) {
            let feedStorys = state.storys[story.feed.id]
            if (_.isNil(feedStorys)) {
                Vue.set(state.storys, story.feed.id, {})
                feedStorys = state.storys[story.feed.id]
            }
            addOrUpdateStory(feedStorys, story)
        },
        ADD_OR_UPDATE_LIST(state, { feedId, storys }) {
            if (_.isEmpty(feedId)) {
                addOrUpdateList(state, storys)
            } else {
                let feedStorys = state.storys[feedId]
                if (_.isNil(feedStorys)) {
                    Vue.set(state.storys, feedId, {})
                    feedStorys = state.storys[feedId]
                }
                storys.forEach(story => {
                    addOrUpdateStory(feedStorys, story)
                })
            }
        },
        ADD_OR_UPDATE_MUSHROOMS(state, storys) {
            addOrUpdateList(state, storys)
            state.mushrooms = storys
        },
        SET_SORTED_MUSHROOMS(state, storys) {
            state.mushroomsSorted = true
            state.mushrooms = storys
        },
        DELETE_STORYS_OF_FEED(state, feedId) {
            Vue.delete(state.storys, feedId)
            state.mushrooms = state.mushrooms.filter(x => {
                return x.feed.id !== feedId
            })
        },
        DELETE_STORYS_OF_ALL_FEED(state, { feedIds = null } = {}) {
            if (_.isNil(feedIds)) {
                state.storys = {}
                state.mushrooms = []
                return
            }
            let feedIdsMap = {}
            feedIds.forEach(feedId => { feedIdsMap[feedId] = 1 });
            feedIds.forEach(feedId => { Vue.delete(state.storys, feedId) })
            state.mushrooms = state.mushrooms.filter(x => {
                return _.isNil(feedIdsMap[x.feed.id])
            })
        }
    },
    getters: {
        get(state) {
            return ({ feedId, offset }) => {
                return _.defaultTo(state.storys[feedId], {})[offset]
            }
        },
        getListByFeed(state) {
            return feedId => {
                let feedStorys = state.storys[feedId]
                if (_.isNil(feedStorys)) {
                    return []
                }
                return _.chain(_.values(feedStorys)).sortBy('offset').value()
            }
        },
        mushrooms(state) {
            return state.mushrooms
        },
        numUnreadMushrooms(state, API) {
            function notRead(story) {
                let feed = API.feed.get(story.feed.id)
                if (_.isNil(feed)) {
                    return true
                }
                return story.offset >= feed.story_offset
            }
            return state.mushrooms.filter(notRead).length
        },
        favorited(state) {
            let favorited = []
            _.values(state.storys).forEach(feedStorys => {
                _.values(feedStorys).forEach(story => {
                    if (story.is_favorited) {
                        favorited.push(story)
                    }
                })
            })
            return _.orderBy(favorited, ['dt_created', 'id'], ['desc', 'desc'])
        },
        isReaded(state, API) {
            return story => {
                let feed = API.feed.get(story.feed.id)
                if (_.isNil(feed)) {
                    return false
                }
                return story.offset < feed.story_offset
            }
        }
    },
    actions: {
        async setFavorited(DAO, { feedId, offset, is_favorited }) {
            await API.story.setFavorited({ feed_id: feedId, offset, is_favorited: is_favorited })
            DAO.SET_FAVORITED({ feed_id: feedId, offset, is_favorited })
        },
        async setWatched(DAO, { feedId, offset, is_watched }) {
            await API.story.setWatched({ feed_id: feedId, offset, is_watched: is_watched })
            DAO.SET_WATCHED({ feed_id: feedId, offset, is_watched })
        },
        async load(DAO, { feedId, offset, detail }) {
            let story = await API.story.get({ feed_id: feedId, offset, detail })
            DAO.ADD_OR_UPDATE(story)
        },
        async loadList(DAO, { feedId, offset, detail, size }) {
            let data = await API.story.query({ feed_id: feedId, offset, detail, size })
            DAO.ADD_OR_UPDATE_LIST({ feedId, storys: data.storys })
        },
        async loadMushrooms(DAO, { feedIds, days, detail }) {
            await DAO.state.mushroomsLoading.begin(async () => {
                let data = await API.story.queryRecent({ feed_ids: feedIds, days, detail })
                DAO.ADD_OR_UPDATE_MUSHROOMS(data.storys)
                console.log("loadMushrooms done");
            })
        },
        async loadFavorited(DAO) {
            await DAO.state.favoritedLoading.begin(async () => {
                let data = await API.story.listFavorited()
                DAO.ADD_OR_UPDATE_LIST({ storys: data.storys })
            })
        },
        sortMushrooms(DAO) {
            if (!DAO.state.mushroomsSorted) {
                let mushrooms = sortMushrooms(DAO.state.mushrooms, DAO.API)
                DAO.SET_SORTED_MUSHROOMS(mushrooms)
            }
        }
    }
}