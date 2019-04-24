import Vue from 'vue'
import _ from 'lodash'


const USER = {
    USER_LOGIN(state, loginUser) {
        state.user.loginUser = loginUser
    },
}

function _story_add(state, story) {
    Vue.set(state.story.storys, story.id, story)
    let feedId = story.feed.id
    let feedStoryIds = state.story.feedStoryMap[feedId]
    if (_.isNil(feedStoryIds)) {
        Vue.set(state.story.feedStoryMap, feedId, {})
        feedStoryIds = state.story.feedStoryMap[feedId]
    }
    Vue.set(feedStoryIds, story.id, null)
}


const FEED = {
    FEED_SYNC(state, {updatedFeeds, deletedFeedIds}) {
        _.defaultTo(deletedFeedIds, []).forEach(feedId => {
            Vue.delete(state.feed.feeds, feedId)
        })
        _.defaultTo(updatedFeeds, []).forEach(feed => {
            Vue.set(state.feed.feeds, feed.id, feed)
        });
        let feedList = _.chain(_.values(state.feed.feeds))
            .sortBy('dt_updated', 'id')
            .reverse()
            .value()
        state.feed.feedList = feedList
    },
    FEED_ADD_OR_UPDATE(state, feed) {
        Vue.set(state.feed.feeds, feed.id, feed)
    },
    FEED_REMOVE(state, { id }) {
        Vue.delete(state.feed.feeds, id)
        state.feed.feedList = _.filter(state.feed.feedList, feed => feed.id !== id)
    },
    FEED_SET_READED(state, { id, offset }) {
        let feed = state.feed.feeds[id]
        feed.story_offset = offset
        feed.num_unread_storys = feed.total_storys - offset
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
        if (_.isNil(cursor)) {
            Vue.set(state.story.cursor.hasPrev, feedId, false)
        }
    },
    STORY_SET_NEXT_CURSOR(state, { feedId, cursor }) {
        Vue.set(state.story.cursor.next, feedId, cursor)
        if (_.isNil(cursor)) {
            Vue.set(state.story.cursor.hasNext, feedId, false)
        }
    },
    STORY_ADD_DETAIL(state, story) {
        _story_add(state, story)
    },
    STORY_SET_READED(state, { id, is_readed }) {
        state.story.storys[id].is_readed = is_readed;
    },
    STORY_SET_ALL_READED(state) {
        _.values(state.feed.feeds).forEach(feed => {
            feed.num_unread_storys = 0
        })
        _.values(state.story.storys).forEach(story => {
            story.is_readed = true
        })
    },
    STORY_SET_FAVORITED(state, { id, is_favorited }) {
        state.story.storys[id].is_favorited = is_favorited;
    },
    STORY_SET_SCROLL_TOP(state, { feedId, scrollTop }) {
        Vue.set(state.story.scrollTop, feedId, scrollTop)
    },
}


export default {
    ...USER,
    ...FEED,
    ...STORY,
}
