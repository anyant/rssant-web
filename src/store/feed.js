import _ from 'lodash'
import Vue from 'vue'
import { differenceInDays, isAfter, subDays } from 'date-fns'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'


function sortFeedList(feedList) {
    return _.chain(feedList)
        .sortBy([
            function (x) { return x.num_unread_storys > 0 },
            function (x) { return new Date(x.dt_updated) },
            'id'
        ])
        .reverse()
        .value()
}

function groupFeedList(feedList) {
    // garden 菌圃    更新周期>=3的订阅
    // jungle 丛林    更新周期<3的订阅
    // desert 沙漠    最近18个月未更新的订阅
    // trash  废墟    无效/无法访问的订阅
    let garden = []
    let jungle = []
    let desert = []
    let trash = []
    const MONTH_18 = 18 * 30
    feedList.forEach(feed => {
        if (feed.status === 'error') {
            trash.push(feed)
            return
        }
        if (feed.total_storys <= 0) {
            desert.push(feed)
            return
        }
        if (_.isEmpty(feed.dt_latest_story_published)) {
            desert.push(feed)
            return
        }
        let now = new Date()
        let dt_latest = new Date(feed.dt_latest_story_published)
        if (Math.abs(differenceInDays(now, dt_latest)) > MONTH_18) {
            desert.push(feed)
            return
        }
        if (feed.dryness >= 500) {
            garden.push(feed)
        } else {
            jungle.push(feed)
        }
    })
    return { garden, jungle, desert, trash }
}

function numUnreadFeedsOf(feeds) {
    return feeds.filter(feed => feed.num_unread_storys > 0).length
}

function updateFeedList(state) {
    let { garden, jungle, desert, trash } = groupFeedList(_.values(state.feeds))
    state.garden = sortFeedList(garden)
    state.jungle = sortFeedList(jungle)
    state.desert = sortFeedList(desert)
    state.trash = sortFeedList(trash)
}

function fixTitle(feed) {
    if (_.isEmpty(feed.title)) {
        feed.title = `#${feed.id}`
    }
    return feed
}

function addOrUpdateCreation(state, creation) {
    let old = state.creations[creation.id]
    if (!_.isNil(old) && _.isEmpty(creation.message)) {
        creation.message = old.message
    }
    Vue.set(state.creations, creation.id, creation)
}

function watchFeedCreation(DAO, { creationId, numTry = 30 }) {
    const token = setInterval(() => {
        API.feed.getCreation({ id: creationId }).then(creation => {
            DAO.ADD_OR_UPDATE_CREATION(creation)
            if (creation.status === 'ready') {
                clearInterval(token)
                DAO.API.feed.load({ feedId: creation.feed_id })
            } else if (creation.status === 'error' || numTry <= 0) {
                clearInterval(token)
            }
        }).finally(() => {
            numTry -= 1
        })
    }, 1000)
}

function handleImportedFeedResult(DAO, data) {
    DAO.ADD_OR_UPDATE_LIST(data.created_feeds)
    DAO.ADD_OR_UPDATE_CREATION_LIST(data.feed_creations)
    if (data.feed_creations.length === 1) {
        watchFeedCreation(DAO, { creationId: data.feed_creations[0].id })
    }
    return {
        numFeedCreations: data.feed_creations.length,
        numCreatedFeeds: data.created_feeds.length,
        numExistedFeeds: data.num_existed_feeds,
    }
}


export default {
    state: {
        loading: new Loading(),
        creations: {},
        feeds: {},
        garden: [],
        jungle: [],
        desert: [],
        trash: [],
    },
    mutations: {
        SYNC(state, { updatedFeeds, deletedFeedIds }) {
            _.defaultTo(deletedFeedIds, []).forEach(feedId => {
                Vue.delete(state.feeds, feedId)
            })
            _.defaultTo(updatedFeeds, []).forEach(feed => {
                Vue.set(state.feeds, feed.id, fixTitle(feed))
            });
            updateFeedList(state)
        },
        ADD_OR_UPDATE_CREATION(state, creation) {
            addOrUpdateCreation(state, creation)
        },
        ADD_OR_UPDATE_CREATION_LIST(state, creationList) {
            creationList.forEach(creation => {
                addOrUpdateCreation(state, creation)
            })
        },
        ADD_OR_UPDATE(state, feed) {
            Vue.set(state.feeds, feed.id, fixTitle(feed))
            updateFeedList(state)
        },
        ADD_OR_UPDATE_LIST(state, feedList) {
            feedList.forEach(feed => {
                Vue.set(state.feeds, feed.id, fixTitle(feed))
            })
            updateFeedList(state)
        },
        REMOVE(state, { id }) {
            Vue.delete(state.feeds, id)
            updateFeedList(state)
        },
        REMOVE_ALL(state, { feedIds = null } = {}) {
            if (_.isNil(feedIds)) {
                state.feeds = {}
            } else {
                feedIds.forEach(id => { Vue.delete(state.feeds, id) })
            }
            updateFeedList(state)
        },
        SET_STORY_OFFSET(state, { id, offset }) {
            let feed = state.feeds[id]
            feed.story_offset = offset
            feed.num_unread_storys = feed.total_storys - offset
        },
        SET_ALL_READED(state, { feedIds }) {
            feedIds.forEach(feedId => {
                let feed = state.feeds[feedId]
                feed.story_offset = feed.total_storys
                feed.num_unread_storys = 0
            })
        }
    },
    getters: {
        isLoading(state) {
            return state.loading.isLoading
        },
        creations(state) {
            return _.chain(_.values(state.creations))
                .sortBy('dt_created', 'status')
                .reverse()
                .value()
        },
        getCreation(state) {
            return creationId => {
                return state.creations[creationId]
            }
        },
        garden(state) {
            return state.garden
        },
        numUnreadGarden(state) {
            return numUnreadFeedsOf(state.garden)
        },
        jungle(state) {
            return state.jungle
        },
        numUnreadJungle(state) {
            return numUnreadFeedsOf(state.jungle)
        },
        desert(state) {
            return state.desert
        },
        numUnreadDesert(state) {
            return numUnreadFeedsOf(state.desert)
        },
        trash(state) {
            return state.trash
        },
        numUnreadTrash(state) {
            return numUnreadFeedsOf(state.trash)
        },
        recentGarden(state) {
            const dt_recent = subDays(new Date(), 14)
            return state.garden.filter(feed => {
                let dt_latest = new Date(feed.dt_latest_story_published)
                return isAfter(dt_latest, dt_recent)
            })
        },
        feedList(state) {
            return _.values(state.feeds)
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
                let hints = []
                _.values(DAO.state.feeds).forEach(x => {
                    if (!_.isEmpty(x.dt_updated)) {
                        hints.push({ id: x.id, dt_updated: x.dt_updated })
                    }
                })
                await API.feed.query({ hints }).then(result => {
                    DAO.SYNC({
                        updatedFeeds: result.feeds,
                        deletedFeedIds: result.deleted_ids
                    })
                })
                await API.feed.queryCreationList().then(result => {
                    DAO.ADD_OR_UPDATE_CREATION_LIST(result.feed_creations)
                })
            })
        },
        async load(DAO, { feedId, detail }) {
            let feed = await API.feed.get({ id: feedId, detail })
            DAO.ADD_OR_UPDATE(feed)
        },
        async loadCreation(DAO, { creationId, detail }) {
            let creation = await API.feed.getCreation({ id: creationId, detail })
            DAO.ADD_OR_UPDATE_CREATION(creation)
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
            DAO.API.story.DELETE_STORYS_OF_FEED(feedId)
        },
        async deleteAll(DAO, { feedIds = null } = {}) {
            if (_.isNil(feedIds) || feedIds.length > 0) {
                await API.feed.deleteAll({ ids: feedIds })
                DAO.REMOVE_ALL({ feedIds })
                DAO.API.story.DELETE_STORYS_OF_ALL_FEED({ feedIds })
            }
        },
        async import(DAO, { text }) {
            let data = await API.feed.import({ text })
            return handleImportedFeedResult(DAO, data)
        },
        async importFile(DAO, { file }) {
            let data = await API.feed.importFile({ file })
            return handleImportedFeedResult(DAO, data)
        },
        exportOPML(DAO, { download } = {}) {
            API.feed.exportOPML({ download })
        },
        async setStoryOffset(DAO, { feedId, offset }) {
            if (DAO.get(feedId).story_offset !== offset) {
                await API.feed.setStoryOffset({ id: feedId, offset })
                DAO.SET_STORY_OFFSET({ id: feedId, offset })
            }
        },
        async setAllReaded(DAO, { feedIds }) {
            feedIds = feedIds.filter(feedId => {
                return DAO.get(feedId).num_unread_storys > 0
            })
            if (feedIds.length > 0) {
                await API.feed.setAllReaded({ ids: feedIds })
                DAO.SET_ALL_READED({ feedIds })
            }
        }
    }
}