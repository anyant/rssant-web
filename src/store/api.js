import * as lodash from 'lodash-es'

import { API } from '@/plugin/api'
import STORE from './state'

import {
    USER_LOGIN,
    FEED_ADD_LIST,
    FEED_ADD,
    FEED_REMOVE,
    FEED_ADD_DETAIL,
    FEED_UPDATE,
    FEED_SET_NEXT_CURSOR,
    STORY_ADD_LIST,
    STORY_ADD_DETAIL,
    STORY_SET_READED,
    STORY_SET_FAVORITED,
    STORY_SET_NEXT_CURSOR,
} from './mutation-types'


const StoreAPI = {
    user: {
        async autoLogin() {
            let user = null
            try {
                user = await API.user.me()
            } catch (e) {
                throw e
            } finally {
                STORE.commit(USER_LOGIN, user)
            }
        },
        isLoading() {
            return STORE.state.user.isLoading
        },
        isLogined() {
            return (!STORE.state.user.isLoading) && (!lodash.isNil(STORE.state.user.loginUser))
        },
        getLoginUser() {
            return STORE.state.user.loginUser
        }
    },
    feed: {
        async loadInitFeedList({ size } = {}) {
            let result = await API.feed.list({ size })
            STORE.commit(FEED_ADD_LIST, result.results)
            STORE.commit(FEED_SET_NEXT_CURSOR, result.next)
        },
        async loadNextFeedList({ size } = {}) {
            let cursor = STORE.state.feed.cursor.next
            if (lodash.isEmpty(cursor)) {
                return
            }
            let result = await API.feed.list({ cursor: cursor, size: size })
            STORE.commit(FEED_ADD_LIST, result.results)
            STORE.commit(FEED_SET_NEXT_CURSOR, result.next)
        },
        async loadFeed({ feedId, detail }) {
            let feed = await API.feed.get({ id: feedId, detail })
            STORE.commit(FEED_ADD_DETAIL, feed)
        },
        async createFeed({ url }) {
            let feed = await API.feed.create({ url })
            STORE.commit(FEED_ADD, feed)
            const feedId = feed.id
            let numTry = 30
            const token = setInterval(async () => {
                try {
                    feed = await API.feed.get({ id: feedId })
                } finally {
                    numTry -= 1
                    if (feed.status === 'ready' || feed.status === 'error' || numTry <= 0) {
                        clearInterval(token)
                        STORE.commit(FEED_UPDATE, feed)
                    }
                }
            }, 1000)
        },
        async updateFeed({ feedId, title }) {
            let newFeed = await API.feed.update({
                id: feedId,
                title: title
            })
            STORE.commit(FEED_UPDATE, newFeed)
        },
        async deleteFeed({ feedId }) {
            await API.feed.delete({
                id: feedId
            })
            STORE.commit(FEED_REMOVE, { id: feedId })
        },
        isLoading() {
            return STORE.state.feed.isLoading
        },
        getFeedList() {
            return STORE.getters.feedList
        },
        getFeed({ feedId }) {
            return STORE.state.feed.feeds[feedId]
        },
        hasNext() {
            return STORE.state.feed.cursor.hasNext
        }
    },
    story: {
        async loadInitStoryList({ feedId, size } = {}) {
            let result = await API.story.list({
                feed_id: feedId,
                size: size
            })
            STORE.commit(STORY_ADD_LIST, result.results)
            STORE.commit(STORY_SET_NEXT_CURSOR, { feedId, cursor: result.next })
        },
        async loadNextStoryList({ feedId, size } = {}) {
            let cursor = STORE.state.story.cursor.next[feedId]
            if (lodash.isEmpty(cursor)) {
                return
            }
            let result = await API.story.list({ feed_id: feedId, cursor: cursor, size: size })
            STORE.commit(STORY_ADD_LIST, result.results)
            STORE.commit(STORY_SET_NEXT_CURSOR, { feedId, cursor: result.next })
        },
        async loadStory({ storyId, detail }) {
            let story = await API.story.get({ id: storyId, detail })
            STORE.commit(STORY_ADD_DETAIL, story)
        },
        async setStoryReaded({ storyId, is_readed }) {
            await API.story.setReaded({ id: storyId, is_readed: is_readed })
            STORE.commit(STORY_SET_READED, { is_readed })
        },
        async setStoryFavorited({ storyId, is_favorited }) {
            await API.story.setFavorited({ id: storyId, is_favorited: is_favorited })
            STORE.commit(STORY_SET_FAVORITED, { is_favorited })
        },
        getStoryList({ feedId }) {
            let storyIds = STORE.state.story.feedStoryMap[feedId]
            if (lodash.isNil(storyIds)) {
                return []
            }
            storyIds = lodash.keys(storyIds)
            let storys = lodash.map(storyIds, storyId => {
                return STORE.state.story.storys[storyId]
            })
            return lodash
                .chain(storys)
                .sortBy('dt_updated', 'id')
                .value()
        },
        getStory({ storyId }) {
            return STORE.state.story.storys[storyId]
        },
        hasNext({ feedId }) {
            let hasNext = STORE.state.story.cursor.hasNext[feedId]
            return lodash.isNil(hasNext) || hasNext
        }
    }
}

export default StoreAPI