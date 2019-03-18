import Vue from 'vue'
import lodash from 'lodash'

import { API } from '@/plugin/api'
import { DAO, STATE } from './dao'

const EventBus = new Vue()
export { EventBus }

const StoreAPI = {
    state: STATE,
    $emit: EventBus.$emit.bind(EventBus),
    $on: EventBus.$on.bind(EventBus),
    user: {
        onLogin(callback) {
            if (this.isLogined()) {
                callback()
            } else {
                EventBus.$on('user.login', callback)
            }
        },
        async login({ account, password } = {}) {
            let user = null
            try {
                user = await API.user.login({ account, password })
            } finally {
                DAO.USER_LOGIN(user)
            }
            EventBus.$emit('user.login')
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
            return STATE.user.isLoading
        },
        isLogined() {
            return (!STATE.user.isLoading) && (!lodash.isNil(STATE.user.loginUser))
        },
        getLoginUser() {
            return STATE.user.loginUser
        }
    },
    feed: {
        async loadInitFeedList({ size } = {}) {
            let result = await API.feed.list({ size })
            DAO.FEED_ADD_LIST(result.results)
            DAO.FEED_SET_NEXT_CURSOR(result.next)
        },
        async loadNextFeedList({ size } = {}) {
            let cursor = STATE.feed.cursor.next
            if (lodash.isEmpty(cursor)) {
                return
            }
            let result = await API.feed.list({ cursor: cursor, size: size })
            DAO.FEED_ADD_LIST(result.results)
            DAO.FEED_SET_NEXT_CURSOR(result.next)
        },
        async loadFeed({ feedId, detail }) {
            let feed = await API.feed.get({ id: feedId, detail })
            DAO.FEED_ADD_DETAIL(feed)
        },
        async createFeed({ url }) {
            let feed = await API.feed.create({ url })
            DAO.FEED_ADD(feed)
            const feedId = feed.id
            let numTry = 30
            const token = setInterval(async () => {
                try {
                    feed = await API.feed.get({ id: feedId })
                } finally {
                    numTry -= 1
                    if (feed.status === 'ready' || feed.status === 'error' || numTry <= 0) {
                        clearInterval(token)
                        DAO.FEED_UPDATE(feed)
                    }
                }
            }, 1000)
        },
        async updateFeed({ feedId, title }) {
            let newFeed = await API.feed.update({
                id: feedId,
                title: title
            })
            DAO.FEED_UPDATE(newFeed)
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
        async setFeedReaded({ feedId }) {
            await API.feed.setReaded({ id: feedId })
            DAO.FEED_SET_READED({ id: feedId })
        },
        isLoading() {
            return STATE.feed.isLoading
        },
        getFeedList() {
            return lodash
                .chain(lodash.values(STATE.feed.feeds))
                .sortBy('dt_updated', 'id')
                .reverse()
                .value()
        },
        getFeed({ feedId }) {
            return STATE.feed.feeds[feedId]
        },
        hasNext() {
            return STATE.feed.cursor.hasNext
        }
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
            if (lodash.isEmpty(cursor)) {
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
            if (lodash.isNil(storyIds)) {
                return []
            }
            storyIds = lodash.keys(storyIds)
            let storys = lodash.map(storyIds, storyId => {
                return STATE.story.storys[storyId]
            })
            return lodash
                .chain(storys)
                .sortBy('dt_updated', 'id')
                .value()
        },
        getStory({ storyId }) {
            return STATE.story.storys[storyId]
        },
        hasNext({ feedId }) {
            let hasNext = STATE.story.cursor.hasNext[feedId]
            return lodash.isNil(hasNext) || hasNext
        }
    }
}

export default StoreAPI