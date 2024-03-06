<template>
    <div class="feed-list">
        <MoFeedItem class="feed-item" :class="{ 'active': isActiveFeed(feed.id) }" v-for="feed in feedList"
            :key="feed.id" :title="feed.title" :number="feed.total_storys"
            :date="feed.dt_latest_story_published || feed.dt_created" :link="feed.id" :routeTo="onClickFeed">
        </MoFeedItem>
    </div>
</template>


<script>

import { publishFeedStore } from '@/publish/store/feed'
import MoFeedItem from '@/components/MoFeedItem'

export default {
    components: { MoFeedItem },
    props: {
        currentFeedId: {
            type: String,
        },
    },
    computed: {
        feedList() {
            return publishFeedStore.feedList
        },
    },
    methods: {
        isActiveFeed(feedId) {
            return feedId === this.currentFeedId
        },
        async onClickFeed(feedId) {
            if (feedId === this.currentFeedId) { return }
            this.$router.push({ query: { feed: feedId } })
        },
    }
}
</script>


<style lang="less" scoped>
@import '~@/styles/common';

.feed-list {
    .feed-item {
        cursor: pointer;

        &:hover {
            background: lighten(@antFibre, 16%);
        }

        &.active {
            background: lighten(@antFibre, 12%);
        }
    }
}
</style>