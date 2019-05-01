import _ from 'lodash'
import Vue from 'vue'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'


export default {
    state: {
        storys: {},
        mushrooms: [],
        mushroomsLoading: new Loading()
    },
    mutations: {
        SET_FAVORITED(state, { id, is_favorited }) {
            state.storys[id].is_favorited = is_favorited;
        },
        SET_WATCHED(state, { id, is_watched }) {
            state.storys[id].is_watched = is_watched;
        },
        ADD_OR_UPDATE(state, story) {
            let feedStorys = state.storys[story.feed.id]
            if (_.isNil(feedStorys)) {
                Vue.set(state.storys, story.feed.id, {})
                feedStorys = state.storys[story.feed.id]
            }
            Vue.set(feedStorys, story.offset, story)
        },
        ADD_OR_UPDATE_LIST(state, { feedId, storys }) {
            let feedStorys = state.storys[feedId]
            if (_.isNil(feedStorys)) {
                Vue.set(state.storys, feedId, {})
                feedStorys = state.storys[feedId]
            }
            storys.forEach(story => {
                Vue.set(feedStorys, story.offset, story)
            })
        },
        ADD_OR_UPDATE_MUSHROOMS(state, storys) {
            storys.forEach(story => {
                let feedStorys = state.storys[story.feed.id]
                if (_.isNil(feedStorys)) {
                    Vue.set(state.storys, story.feed.id, {})
                    feedStorys = state.storys[story.feed.id]
                }
                Vue.set(feedStorys, story.offset, story)
            })
            state.mushrooms = storys
        },
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
            DAO.ADD_OR_UPDATE_LIST({ feedId, storys: data.results })
        },
        async loadMushrooms(DAO, { feedIds, days, detail }) {
            await DAO.state.mushroomsLoading.begin(async () => {
                let data = await API.story.queryRecent({ feed_ids: feedIds, days, detail })
                DAO.ADD_OR_UPDATE_MUSHROOMS(data.results)
            })
        }
    }
}