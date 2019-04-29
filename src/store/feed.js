import _ from 'lodash'
import Vue from 'vue'
import { differenceInDays } from 'date-fns'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'


function sortFeedList(feedList) {
    return _.chain(feedList)
        .sortBy('dt_updated', 'id')
        .reverse()
        .value()
}

function groupFeedList(feedList) {
    let mushrooms = []
    let leaves = []
    let deadwoods = []
    feedList.forEach(feed => {
        if (feed.total_storys <= 0) {
            deadwoods.push(feed)
            return
        }
        if (_.isEmpty(feed.dt_latest_story_published)) {
            deadwoods.push(feed)
            return
        }
        let now = new Date()
        let dt_latest = new Date(feed.dt_latest_story_published)
        if (Math.abs(differenceInDays(now, dt_latest)) > 18 * 30) {
            deadwoods.push(feed)
            return
        }
        if (feed.story_publish_period > 7) {
            mushrooms.push(feed)
        } else {
            leaves.push(feed)
        }
    })
    return { mushrooms, leaves, deadwoods }
}

function updateFeedList(state) {
    let { mushrooms, leaves, deadwoods } = groupFeedList(_.values(state.feeds))
    state.mushrooms = sortFeedList(mushrooms)
    state.leaves = sortFeedList(leaves)
    state.deadwoods = sortFeedList(deadwoods)
}

export default {
    state: {
        loading: new Loading(),
        feeds: {},
        mushrooms: [],
        leaves: [],
        deadwoods: [],
    },
    mutations: {
        SYNC(state, { updatedFeeds, deletedFeedIds }) {
            _.defaultTo(deletedFeedIds, []).forEach(feedId => {
                Vue.delete(state.feeds, feedId)
            })
            _.defaultTo(updatedFeeds, []).forEach(feed => {
                Vue.set(state.feeds, feed.id, feed)
            });
            updateFeedList(state)
        },
        ADD_OR_UPDATE(state, feed) {
            Vue.set(state.feeds, feed.id, feed)
            updateFeedList(state)
        },
        REMOVE(state, { id }) {
            Vue.delete(state.feeds, id)
            updateFeedList(state)
        },
        SET_READED(state, { id, offset }) {
            let feed = state.feeds[id]
            feed.story_offset = offset
            feed.num_unread_storys = feed.total_storys - offset
        },
    },
    getters: {
        isLoading(state) {
            return state.loading.isLoading
        },
        mushrooms(state) {
            return state.mushrooms
        },
        leaves(state) {
            return state.leaves
        },
        deadwoods(state) {
            return state.deadwoods
        },
        get(state) {
            return feedId => {
                return state.feeds[feedId]
            }
        },
    },
    actions: {
        async sync(DAO) {
            await DAO.state.loading.begin(async () => {
                let hints = _.values(DAO.state.feeds).map(x => {
                    return { id: x.id, dt_updated: x.dt_updated }
                })
                await API.feed.query({ hints }).then(result => {
                    DAO.SYNC({
                        updatedFeeds: result.results,
                        deletedFeedIds: result.deleted_ids
                    })
                })
            })
        },
        async load(DAO, { feedId, detail }) {
            let feed = await API.feed.get({ id: feedId, detail })
            DAO.ADD_OR_UPDATE(feed)
        },
        async create(DAO, { url }) {
            let feed = await API.feed.create({ url })
            DAO.ADD_OR_UPDATE(feed)
            const feedId = feed.id
            let numTry = 30
            const token = setInterval(async () => {
                try {
                    feed = await API.feed.get({ id: feedId })
                } finally {
                    numTry -= 1
                    if (feed.status === 'ready' || feed.status === 'error' || numTry <= 0) {
                        clearInterval(token)
                        DAO.ADD_OR_UPDATE(feed)
                    }
                }
            }, 1000)
        },
        async update(DAO, { feedId, title }) {
            let newFeed = await API.feed.update({
                id: feedId,
                title: title
            })
            DAO.ADD_OR_UPDATE(newFeed)
        },
        async delete(DAO, { feedId }) {
            await API.feed.delete({
                id: feedId
            })
            DAO.REMOVE({ id: feedId })
        },
        async importOPML(DAO, { file }) {
            let data = await API.feed.importOPML({ file })
            DAO.ADD_LIST(data.feeds)
        },
        async importBookmark(DAO, { file }) {
            let data = await API.feed.importBookmark({ file })
            DAO.ADD_LIST(data.feeds)
        },
        async setReaded(DAO, { feedId, offset }) {
            await API.feed.setReaded({ id: feedId, offset })
            DAO.SET_READED({ id: feedId, offset })
        },
    }
}