<template>
    <div class="story-detail">
        <MoStoryContent v-for="story in [story]" :key="`${story.feed.id}-${story.offset}`" class="story-content" ref="contentRef" :story="story" :next-feed="null" :next-story="null"
            :show-next-feed-title="false" :image-viewer-container-getter="null">
        </MoStoryContent>
    </div>
</template>


<script>
import { publishStoryStore } from '@/publish/store/story'
import MoStoryContent from '@/components/MoStoryContent'
import _ from 'lodash';

export default {
    components: { MoStoryContent },
    props: {
        currentFeedId: {
            type: String,
        },
        currentOffset: {
            type: Number,
        },
    },
    computed: {
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
}
</script>


<style lang="less" scoped>
@import '~@/styles/common';

.story-content {
    background: @antBackWhite;
}
</style>