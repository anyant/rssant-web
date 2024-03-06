<template>
    <div class="home-page">
        <MoHeader border>
            <MoDebugTool class="title">蚁阅</MoDebugTool>
        </MoHeader>
        <MoLayout grey header class="main" :style="mainStyle">
            <PubFeedList :currentFeedId="currentFeedId" />
            <PubStoryList v-if="feed" :currentFeedId="currentFeedId" :currentOffset="currentOffset" />
            <PubStoryDetail v-if="story" :currentFeedId="currentFeedId" :currentOffset="currentOffset" />
        </MoLayout>
    </div>
</template>


<script>
import MoHeader from '@/components/MoHeader';
import MoDebugTool from '@/components/MoDebugTool';
import MoLayout from '@/components/MoLayout'
import { publishFeedStore } from '@/publish/store/feed'
import { publishStoryStore } from '@/publish/store/story'
import _ from 'lodash';
import PubStoryList from '@/publish/views/StoryList.vue';
import PubFeedList from '@/publish/views/FeedList.vue';
import PubStoryDetail from '@/publish/views/StoryDetail.vue';

export default {
    components: {
        MoHeader, MoDebugTool, MoLayout, PubStoryList, PubFeedList, PubStoryDetail
    },
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
    methods: {}
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
    }

    .story-detail {
        flex: 1;
    }
}
</style>