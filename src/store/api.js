import _ from 'lodash'

import { API } from '@/plugin/api'
import { DAO, STATE } from './dao'

const StoreAPI = {
    state: STATE,
    user: {
        async login({ account, password } = {}) {
            if (!_.isNil(account)) {
                if (STATE.user.loading.isFinished) {
                    STATE.user.loading.reset()
                }
            }
            await STATE.user.loading.begin(async () => {
                await API.user.login({ account, password })
                    .then(user => {
                        DAO.USER_LOGIN(user)
                    })
            })
        },
        async register({ username, email, password }) {
            await API.user.register({ username, email, password })
        },
        logout({ next } = {}) {
            API.user.logout({ next })
        },
        loginGithub({ next, scope } = {}) {
            API.user.loginGithub({ next, scope })
        },
        connectGithub({ next, scope } = {}) {
            if (!this.isLogined) { return }
            API.user.connectGithub({ next, scope })
        },
        isLoading() {
            return STATE.user.loading.isLoading
        },
        isLogined() {
            return !_.isNil(STATE.user.loginUser)
        },
        getLoginUser() {
            return STATE.user.loginUser
        }
    },
    feed: {
        async sync() {
            await STATE.feed.loading.begin(async () => {
                let hints = _.values(STATE.feed.feeds).map(x => {
                    return { id: x.id, dt_updated: x.dt_updated }
                })
                await API.feed.query({ hints }).then(result => {
                    DAO.FEED_SYNC({
                        updatedFeeds: result.results,
                        deletedFeedIds: result.deleted_ids
                    })
                })
            })
        },
        async loadFeed({ feedId, detail }) {
            let feed = await API.feed.get({ id: feedId, detail })
            DAO.FEED_ADD_OR_UPDATE(feed)
        },
        async createFeed({ url }) {
            let feed = await API.feed.create({ url })
            DAO.FEED_ADD_OR_UPDATE(feed)
            const feedId = feed.id
            let numTry = 30
            const token = setInterval(async () => {
                try {
                    feed = await API.feed.get({ id: feedId })
                } finally {
                    numTry -= 1
                    if (feed.status === 'ready' || feed.status === 'error' || numTry <= 0) {
                        clearInterval(token)
                        DAO.FEED_ADD_OR_UPDATE(feed)
                    }
                }
            }, 1000)
        },
        async updateFeed({ feedId, title }) {
            let newFeed = await API.feed.update({
                id: feedId,
                title: title
            })
            DAO.FEED_ADD_OR_UPDATE(newFeed)
        },
        async deleteFeed({ feedId }) {
            await API.feed.delete({
                id: feedId
            })
            DAO.FEED_REMOVE({ id: feedId })
        },
        async importOPML({ file }) {
            let data = await API.feed.importOPML({ file })
            DAO.FEED_ADD_LIST(data.feeds)
        },
        async importBookmark({ file }) {
            let data = await API.feed.importBookmark({ file })
            DAO.FEED_ADD_LIST(data.feeds)
        },
        async setFeedReaded({ feedId, offset }) {
            await API.feed.setReaded({ id: feedId, offset })
            DAO.FEED_SET_READED({ id: feedId, offset })
        },
        isLoading() {
            return STATE.feed.loading.isLoading
        },
        getFeedList() {
            return STATE.feed.feedList
        },
        getFeed({ feedId }) {
            return STATE.feed.feeds[feedId]
        },
    },
    story: {
        async loadInitStoryList({ feedId, size } = {}) {
            let result = await API.story.list({
                feed_id: feedId,
                size: size,
                is_readed: false,
            })
            DAO.STORY_ADD_LIST(result.results)
            DAO.STORY_SET_NEXT_CURSOR({ feedId, cursor: result.next })
        },
        async loadNextStoryList({ feedId, size } = {}) {
            let cursor = STATE.story.cursor.next[feedId]
            if (_.isEmpty(cursor)) {
                return
            }
            let result = await API.story.list({ feed_id: feedId, cursor: cursor, size: size })
            DAO.STORY_ADD_LIST(result.results)
            DAO.STORY_SET_NEXT_CURSOR({ feedId, cursor: result.next })
        },
        async loadStory({ storyId, detail }) {
            let story = await API.story.get({ id: storyId, detail })
            DAO.STORY_ADD_DETAIL(story)
        },
        async setStoryReaded({ storyId, is_readed }) {
            await API.story.setReaded({ id: storyId, is_readed: is_readed })
            DAO.STORY_SET_READED({ id: storyId, is_readed })
        },
        async setStoryAllReaded() {
            await API.story.setAllReaded()
            DAO.STORY_SET_ALL_READED()
        },
        async setStoryFavorited({ storyId, is_favorited }) {
            await API.story.setFavorited({ id: storyId, is_favorited: is_favorited })
            DAO.STORY_SET_FAVORITED({ id: storyId, is_favorited })
        },
        getStoryList({ feedId }) {
            let storyIds = STATE.story.feedStoryMap[feedId]
            if (_.isNil(storyIds)) {
                return []
            }
            storyIds = _.keys(storyIds)
            let storys = _.map(storyIds, storyId => {
                return STATE.story.storys[storyId]
            })
            return _
                .chain(storys)
                .sortBy('dt_updated', 'id')
                .value()
        },
        getStory({ storyId }) {
            return STATE.story.storys[storyId]
        },
        hasNext({ feedId }) {
            let cursor = STATE.story.cursor.next[feedId]
            return !_.isEmpty(cursor)
        },
        setScrollTop({ feedId, scrollTop }) {
            DAO.STORY_SET_SCROLL_TOP({ feedId, scrollTop })
        },
        getScrollTop({ feedId }) {
            return _.defaultTo(STATE.story.scrollTop[feedId], 0)
        }
    }
}

export default StoreAPI