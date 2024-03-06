<template>
    <div class="story-detail">
        <MoStoryContent v-for="story in [story]" :key="`${story.feed.id}-${story.offset}`" class="story-content"
            ref="contentRef" :story="story" :next-feed="feed" :next-story="nextStory" :gotoNextStory="gotoNextStory"
            :show-next-feed-title="false" :image-viewer-container-getter="imageViewerContainerGetter">
        </MoStoryContent>
    </div>
</template>


<script>
import { publishStoryStore } from '@/publish/store/story'
import MoStoryContent from '@/components/MoStoryContent'
import _ from 'lodash';
import { publishFeedStore } from '@/publish/store/feed';

export default {
    components: { MoStoryContent },
    props: {
        currentFeedId: {
            type: String,
        },
        currentOffset: {
            type: Number,
        },
        imageViewerContainerGetter: {
            type: Function,
        },
    },
    computed: {
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
        nextStory() {
            if (!this.story) { return null }
            return publishStoryStore.get({
                feedId: this.currentFeedId,
                offset: this.currentOffset - 1,
            })
        },
    },
    methods: {
        gotoNextStory() {
            let story = this.nextStory
            if (_.isNil(story)) {
                return
            }
            publishStoryStore.doLoad({
                feedId: story.feed.id, offset: story.offset, detail: true,
            })
            let link = { query: { feed: story.feed.id, offset: story.offset } }
            this.$router.replace(link)
        },
    }
}
</script>


<style lang="less" scoped>
@import '~@/styles/common';

.story-content {
    background: @antBackWhite;
}
</style>