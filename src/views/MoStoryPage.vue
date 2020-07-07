<template>
  <MoLayout header class="story">
    <MoBackHeader border>
      <template v-slot:title>{{ headerTitle }}</template>
      <mu-button icon class="action-favorited" @click="toggleFavorited">
        <fa-icon size="18" v-if="isFavorited" icon="star" :color="starColor" />
        <fa-icon size="18" v-else icon="far/star" :color="starColor" />
      </mu-button>
    </MoBackHeader>
    <MoStoryContent :story="story"></MoStoryContent>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import MoStoryContent from '@/components/MoStoryContent'

export default {
  components: { MoBackHeader, MoLayout, MoStoryContent },
  data() {
    return {}
  },
  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    offset() {
      return parseInt(this.$route.params.offset)
    },
    isFavorited() {
      return !_.isNil(this.story) && this.story.is_favorited
    },
    starColor() {
      if (this.isFavorited) {
        return antGold
      } else {
        return null
      }
    },
    feed() {
      return this.$API.feed.get(this.feedId)
    },
    story() {
      return this.$API.story.get({ feedId: this.feedId, offset: this.offset })
    },
    headerTitle() {
      if (!_.isNil(this.story) && !_.isNil(this.feed)) {
        return `${this.feed.title} - ${this.story.title}`
      } else if (!_.isNil(this.story)) {
        return this.story.title
      } else if (!_.isNil(this.feed)) {
        return this.feed.title
      } else {
        return `#${this.feedId}-${this.offset}`
      }
    },
  },
  mounted() {
    if (_.isNil(this.feed)) {
      this.$API.feed.load({ feedId: this.feedId })
    }
    if (_.isNil(this.story) || _.isEmpty(this.story.content)) {
      this.$API.story.load({ feedId: this.feedId, offset: this.offset, detail: true })
    }
    window.scrollTo(0, 0)
  },
  methods: {
    toggleFavorited() {
      let is_favorited = !this.isFavorited
      this.$API.story.setFavorited({ feedId: this.feedId, offset: this.offset, is_favorited })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.story {
  background: #ffffff;
}

.action-favorited {
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
}
</style>
