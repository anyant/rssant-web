<template>
    <div class="home-page">
        <MoHeader border>
            <MoDebugTool class="title">蚁阅</MoDebugTool>
        </MoHeader>
        <MoLayout grey header class="main" :style="mainStyle">
            <div class="feed-list">
                <MoFeedItem class="feed-item" :class="{ 'active': isActiveFeed(feed.id) }" v-for="feed in feedList"
                    :key="feed.id" :title="feed.title" :number="feed.total_storys"
                    :date="feed.dt_latest_story_published || feed.dt_created" :link="feed.id" :routeTo="onClickFeed">
                </MoFeedItem>
            </div>
            <div class="story-list" v-if="feed">
                <MoScrollList v-for="feed in [feed]" class="scroll-list" :key="feed.id" :itemSize="40" reversed
                    :items="storyList" :init-offset="currentOffset" :begin-offset="beginOffset" :end-offset="endOffset"
                    :total="feed.total_storys" :load="loadStorys">
                    <MoStoryItem class="story-item" :class="{ 'active': isActiveStory(story.feed.id, story.offset) }"
                        v-for="story in storyList" :key="`${story.feed.id}-${story.offset}`" :feedId="story.feed.id"
                        :offset="story.offset" :story="story" solo @click="onClickStory(story.feed.id, story.offset)">
                    </MoStoryItem>
                </MoScrollList>
            </div>
            <div class="story-detail" v-if="story">
                <MoStoryContent v-for="story in [story]" :key="`${story.feed.id}-${story.offset}`" class="story-content"
                    ref="contentRef" :story="story" :next-feed="null" :next-story="null" :show-next-feed-title="false"
                    :image-viewer-container-getter="null">
                </MoStoryContent>
            </div>
        </MoLayout>
    </div>
</template>


<script>
import MoHeader from '@/components/MoHeader';
import MoDebugTool from '@/components/MoDebugTool';
import MoLayout from '@/components/MoLayout'
import { publishFeedStore } from '@/publish/store/feed'
import { publishStoryStore } from '@/publish/store/story'
import MoFeedItem from '@/components/MoFeedItem'
import MoStoryItem from '@/components/MoStoryItem'
import MoStoryContent from '@/components/MoStoryContent'
import _ from 'lodash';
import MoScrollList from '@/components/MoScrollList.vue';

export default {
    components: { MoHeader, MoDebugTool, MoLayout, MoFeedItem, MoStoryItem, MoStoryContent, MoScrollList },
    data() {
        return {
            isReady: false,
            showHeader: false
        }
    },
    computed: {
        mainStyle() {
            return {
                width: '100%',
                maxWidth: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                overflow: 'auto',
            }
        },
        feedList() {
            return publishFeedStore.feedList
        },
        currentFeedId() {
            let feedId = this.$route.query.feed
            if (!feedId) {
                return null
            }
            return feedId
        },
        currentOffset() {
            if (_.isNil(this.currentFeedId)) {
                return null
            }
            let offset = this.$route.query.offset
            if (!offset) {
                return null
            }
            return _.parseInt(offset)
        },
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
        story() {
            if (_.isNil(this.currentFeedId) || _.isNil(this.currentOffset)) {
                return null
            }
            return publishStoryStore.get({
                feedId: this.currentFeedId,
                offset: this.currentOffset,
            })
        },
    },
    async mounted() {
        await publishFeedStore.doLoad()
        if (!_.isNil(this.currentFeedId) && !_.isNil(this.currentOffset)) {
            await publishStoryStore.doLoad({ feedId: this.currentFeedId, offset: this.currentOffset, detail: true })
        }
        this.isReady = true
    },
    methods: {
        isActiveFeed(feedId) {
            return feedId === this.currentFeedId
        },
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
        async onClickFeed(feedId) {
            if (feedId === this.currentFeedId) { return }
            this.$router.push({ query: { feed: feedId } })
        },
        async onClickStory(feedId, offset) {
            if (feedId === this.currentFeedId && offset === this.currentOffset) {
                return
            }
            await publishStoryStore.doLoad({ feedId: feedId, offset: offset, detail: true })
            if (_.isNil(this.currentOffset)) {
                this.$router.push({ query: { feed: feedId, offset: offset } })
            } else {
                this.$router.replace({ query: { feed: feedId, offset: offset } })
            }
        }
    }
}
</script>


<style lang="less" scoped>
@import '~@/styles/common';

.title {
    color: @antTextBlack;
    font-weight: bold;
    font-size: 16*@pr;
    cursor: default;
}

.main {
    display: flex;
    flex-direction: row;
    height: 100%;

    .feed-list,
    .story-list,
    .story-detail {
        height: 100%;
        overflow-y: auto;
        position: relative;
    }

    .feed-list,
    .story-list {
        border-right: 1*@pr solid @antTextLight;
    }

    .feed-list {
        width: 300*@pr;
    }

    .story-list {
        width: 360*@pr;

        .scroll-list {
            position: absolute;
            overflow: auto;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }
    }

    .story-detail {
        flex: 1;
    }

    .feed-item,
    .story-item {
        cursor: pointer;

        &:hover {
            background: lighten(@antFibre, 16%);
        }

        &.active {
            background: lighten(@antFibre, 12%);
        }
    }

    .story-content {
        background: @antBackWhite;
    }
}
</style>