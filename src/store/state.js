import Vue from 'vue'
import Vuex from 'vuex'
import lodash from 'lodash'

import {
    USER_LOGIN,
    FEED_ADD_LIST,
    FEED_ADD,
    FEED_REMOVE,
    FEED_ADD_DETAIL,
    FEED_UPDATE,
    FEED_SET_PREV_CURSOR,
    FEED_SET_NEXT_CURSOR,
    STORY_ADD_LIST,
    STORY_ADD_DETAIL,
    STORY_SET_READED,
    STORY_SET_FAVORITED,
    STORY_SET_PREV_CURSOR,
    STORY_SET_NEXT_CURSOR,
} from './mutation-types'

Vue.use(Vuex)

function _story_add(state, story) {
    Vue.set(state.story.storys, story.id, story)
    let feedId = story.feed.id
    let feedStoryIds = state.story.feedStoryMap[feedId]
    if (lodash.isNil(feedStoryIds)) {
        Vue.set(state.story.feedStoryMap, feedId, {})
        feedStoryIds = state.story.feedStoryMap[feedId]
    }
    Vue.set(feedStoryIds, story.id, null)
}

const STORE = new Vuex.Store({
    state: {
        user: {
            isLoading: true,
            loginUser: null,
            loginToken: null,
            loginDate: null,
        },
        feed: {
            cursor: {
                hasPrev: true,
                prev: null,
                hasNext: true,
                next: null,
            },
            feeds: {
            },
        },
        story: {
            cursor: {
                prev: {},
                hasPrev: {},
                next: {},
                hasNext: {},
            },
            storys: {

            },
            feedStoryMap: {

            }
        },
    },
    getters: {
        feedList(state) {
            return lodash
                .chain(lodash.values(state.feed.feeds))
                .sortBy('dt_updated', 'id')
                .reverse()
                .value()
        }
    },
    mutations: {
        [USER_LOGIN](state, loginUser) {
            state.user.isLoading = false
            state.user.loginUser = loginUser
        },
        // Feed API
        [FEED_ADD_LIST](state, feedList) {
            feedList.forEach(feed => {
                Vue.set(state.feed.feeds, feed.id, feed)
            });
        },
        [FEED_SET_PREV_CURSOR](state, cursor) {
            state.feed.cursor.prev = cursor
            if (lodash.isNil(cursor)) {
                state.feed.cursor.hasPrev = false
            }
        },
        [FEED_SET_NEXT_CURSOR](state, cursor) {
            state.feed.cursor.next = cursor
            if (lodash.isNil(cursor)) {
                state.feed.cursor.hasNext = false
            }
        },
        [FEED_ADD](state, feed) {
            Vue.set(state.feed.feeds, feed.id, feed)
        },
        [FEED_UPDATE](state, feed) {
            Vue.set(state.feed.feeds, feed.id, feed)
        },
        [FEED_ADD_DETAIL](state, feed) {
            Vue.set(state.feed.feeds, feed.id, feed)
        },
        [FEED_REMOVE](state, { id }) {
            Vue.delete(state.feed.feeds, id)
        },
        // Story API
        [STORY_ADD_LIST](state, storyList) {
            storyList.forEach(story => {
                _story_add(state, story)
            });
        },
        [STORY_SET_PREV_CURSOR](state, { feedId, cursor }) {
            Vue.set(state.story.cursor.prev, feedId, cursor)
            if (lodash.isNil(cursor)) {
                Vue.set(state.story.cursor.hasPrev, feedId, false)
            }
        },
        [STORY_SET_NEXT_CURSOR](state, { feedId, cursor }) {
            Vue.set(state.story.cursor.next, feedId, cursor)
            if (lodash.isNil(cursor)) {
                Vue.set(state.story.cursor.hasNext, feedId, false)
            }
        },
        [STORY_ADD_DETAIL](state, story) {
            _story_add(state, story)
        },
        [STORY_SET_READED](state, { id, is_readed }) {
            state.story.storys[id].is_readed = is_readed;
        },
        [STORY_SET_FAVORITED](state, { id, is_favorited }) {
            state.story.storys[id].is_favorited = is_favorited;
        },
    }
})

export default STORE