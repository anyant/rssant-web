<template>
  <div class="feed-story-item" :class="{ 'feed-story-item-readed': isReaded }" @click="goStory">
    <div class="feed-title" @click.stop="goFeed">{{ feedTitle }}</div>
    <div class="story-title">{{ storyTitle }}</div>
    <div class="story-date">{{ dateText }}</div>
  </div>
</template>

<script>
import _ from 'lodash'
import { formatDateFriendly } from '@/plugin/datefmt'

export default {
  props: {
    feedId: String,
    offset: Number,
    feedTitle: String,
    storyTitle: String,
    storyDate: String,
    isReaded: Boolean,
    source: String,
    routeTo: Function,
    storyLink: String,
    isCtrlKeyHold: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  computed: {
    dateText() {
      return formatDateFriendly(this.storyDate)
    },
  },
  methods: {
    myRouteTo(link) {
      if (_.isNil(this.routeTo)) {
        this.$router.push(link)
      } else {
        this.routeTo(link)
      }
    },
    goFeed() {
      this.myRouteTo(`/feed/${this.feedId}`)
    },
    goStory() {
      if (!_.isNil(this.isReaded) && !this.isReaded) {
        this.$API.feed.setStoryOffset({ feedId: this.feedId, offset: this.offset + 1 })
      }
      if (this.isCtrlKeyHold && !_.isEmpty(this.storyLink)) {
        window.open(this.storyLink, '_blank')
      } else {
        let link = `/story/${this.feedId}-${this.offset}`
        if (!_.isNil(this.source)) {
          link = link + `?source=${this.source}`
        }
        this.myRouteTo(link)
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-story-item {
  position: relative;
  height: 40 * @pr;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  cursor: pointer;
}

.feed-story-item-readed {
  .feed-title,
  .story-title,
  .story-date {
    color: @antTextLight;
  }
}

.feed-title {
  flex-shrink: 0;
  width: 64 * @pr;
  margin-right: 18 * @pr;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  font-size: 15 * @pr;
}

.story-title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15 * @pr;
}

.story-date {
  flex-shrink: 0;
  width: 48 * @pr;
  margin-left: 4 * @pr;
  font-size: 12 * @pr;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;
}
</style>