<template>
    <div class="story-list" :class="{ 'mobile': isMobile, 'wide': !isMobile }">
        <MoScrollList v-for="feed in [feed]" :key="feed.id" class="scroll-list" :itemSize="isMobile ? 48 : 40" reversed
            :items="storyList" :init-offset="currentOffset" :begin-offset="beginOffset" :end-offset="endOffset"
            :total="feed.total_storys" :load="loadStorys">
            <MoStoryItem class="story-item" :class="{ 'active': isActiveStory(story.feed.id, story.offset) }"
                v-for="story in storyList" :key="`${story.feed.id}-${story.offset}`" :feedId="story.feed.id"
                :offset="story.offset" :story="story" solo @click="onClickStory(story.feed.id, story.offset)">
            </MoStoryItem>
        </MoScrollList>
    </div>
</template>

<script>
import { publishFeedStore } from '@/publish/store/feed'
import { publishStoryStore } from '@/publish/store/story'
import MoStoryItem from '@/components/MoStoryItem'
import _ from 'lodash';
import MoScrollList from '@/components/MoScrollList.vue';

export default {
    components: {
        MoStoryItem, MoScrollList
    },
    props: {
        currentFeedId: {
            type: String,
        },
        currentOffset: {
            type: Number,
        },
        isMobile: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        feed() {
            if (_.isNil(this.currentFeedId)) {
                return null
            }
            return publishFeedStore.get(this.currentFeedId)
        },
        storyList() {
            if (_.isNil(this.currentFeedId)) {
                return []
            }
            let itemList = publishStoryStore.getListByFeed(this.currentFeedId)
            return _.reverse(itemList)
        },
        beginOffset() {
            if (_.isNil(this.currentFeedId)) {
                return null
            }
            return publishStoryStore.getLoadedOffset(this.currentFeedId).begin
        },
        endOffset() {
            if (_.isNil(this.currentFeedId)) {
                return null
            }
            return publishStoryStore.getLoadedOffset(this.currentFeedId).end
        },
    },
    methods: {
        isActiveStory(feedId, offset) {
            return feedId === this.currentFeedId && offset === this.currentOffset
        },
        async loadStorys({ offset, size, resetLoadedOffset, isInit }) {
            return await publishStoryStore.doLoadList({
                feedId: this.currentFeedId,
                offset: offset,
                detail: true,
                size: size,
                resetLoadedOffset: resetLoadedOffset,
                isInit: isInit,
            })
        },
        async onClickStory(feedId, offset) {
            if (feedId === this.currentFeedId && offset === this.currentOffset) {
                return
            }
            await publishStoryStore.doLoadDetail({ feedId: feedId, offset: offset })
            if (_.isNil(this.currentOffset)) {
                this.$router.push({ query: { feed: feedId, offset: offset } })
            } else {
                this.$router.replace({ query: { feed: feedId, offset: offset } })
            }
        },
    }
}

</script>

<style lang="less" scoped>
@import '~@/styles/common';

.story-list {
    position: relative;
    padding-bottom: 8*@pr;

    .story-item {
        cursor: pointer;
    }

    &.wide {
        .story-item {
            &:hover {
                background: lighten(@antFibre, 16%);
            }

            &.active {
                background: lighten(@antFibre, 12%);
            }
        }
    }

    &.mobile {
        .story-item {
            margin-top: 8 * @pr;
        }
    }
}

.scroll-list {
    position: absolute;
    overflow: auto;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
</style>