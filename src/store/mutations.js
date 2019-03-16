import Vue from 'vue'
import lodash from 'lodash'


const USER = {
    USER_LOGIN(state, loginUser) {
        state.user.isLoading = false
        state.user.loginUser = loginUser
    },
}

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


const FEED = {
    FEED_ADD_LIST(state, feedList) {
        feedList.forEach(feed => {
            Vue.set(state.feed.feeds, feed.id, feed)
        });
    },
    FEED_SET_PREV_CURSOR(state, cursor) {
        state.feed.cursor.prev = cursor
        if (lodash.isNil(cursor)) {
            state.feed.cursor.hasPrev = false
        }
    },
    FEED_SET_NEXT_CURSOR(state, cursor) {
        state.feed.cursor.next = cursor
        if (lodash.isNil(cursor)) {
            state.feed.cursor.hasNext = false
        }
    },
    FEED_ADD(state, feed) {
        Vue.set(state.feed.feeds, feed.id, feed)
    },
    FEED_UPDATE(state, feed) {
        Vue.set(state.feed.feeds, feed.id, feed)
    },
    FEED_ADD_DETAIL(state, feed) {
        Vue.set(state.feed.feeds, feed.id, feed)
    },
    FEED_REMOVE(state, { id }) {
        Vue.delete(state.feed.feeds, id)
    },
}

const STORY = {
    STORY_ADD_LIST(state, storyList) {
        storyList.forEach(story => {
            _story_add(state, story)
        });
    },
    STORY_SET_PREV_CURSOR(state, { feedId, cursor }) {
        Vue.set(state.story.cursor.prev, feedId, cursor)
        if (lodash.isNil(cursor)) {
            Vue.set(state.story.cursor.hasPrev, feedId, false)
        }
    },
    STORY_SET_NEXT_CURSOR(state, { feedId, cursor }) {
        Vue.set(state.story.cursor.next, feedId, cursor)
        if (lodash.isNil(cursor)) {
            Vue.set(state.story.cursor.hasNext, feedId, false)
        }
    },
    STORY_ADD_DETAIL(state, story) {
        _story_add(state, story)
    },
    STORY_SET_READED(state, { id, is_readed }) {
        state.story.storys[id].is_readed = is_readed;
    },
    STORY_SET_FAVORITED(state, { id, is_favorited }) {
        state.story.storys[id].is_favorited = is_favorited;
    },
}


export default {
    ...USER,
    ...FEED,
    ...STORY,
}
