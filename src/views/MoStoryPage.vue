<template>
  <MoLayout header class="story">
    <MoBackHeader border>
      <template v-slot:title>{{ headerTitle }}</template>
      <mu-button icon class="action-favorited" @click="toggleFavorited">
        <mu-icon v-if="isFavorited" value="star" :color="starColor"></mu-icon>
        <mu-icon v-else value="star_border" :color="starColor"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="story-info" v-if="story">
      <div class="info-title">{{ story.title }}</div>
      <div class="info-item">
        <span class="info-item-name">原文：</span>
        <a class="info-item-content story-link" :href="story.link" target="_blank">{{ story.link }}</a>
      </div>
      <div class="info-item">
        <span class="info-item-name">发布时间：</span>
        <span class="info-item-content">{{ dateText }}</span>
      </div>
    </div>
    <div class="content" v-if="story">
      <div class="markdown-body" v-html="story.content"></div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import 'github-markdown-css'
import { antGold } from '@/plugin/common'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import { formatFullDate } from '@/plugin/datefmt'

export default {
  components: { MoBackHeader, MoLayout },
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
    dateText() {
      if (_.isNil(this.story)) {
        return ''
      }
      return formatFullDate(this.story.dt_published)
    }
  },
  mounted() {
    if (_.isNil(this.feed)) {
      this.$API.feed.load({ feedId: this.feedId })
    }
    if (_.isNil(this.story) || _.isEmpty(this.story.content)) {
      this.$API.story.load({ feedId: this.feedId, offset: this.offset, detail: true })
    }
  },
  methods: {
    toggleFavorited() {
      let is_favorited = !this.isFavorited
      this.$API.story.setFavorited({ feedId: this.feedId, offset: this.offset, is_favorited })
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.story {
  background: #fff;
}

.action-favorited {
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.story-info {
  margin: 16 * @pr;
  overflow: hidden;
}

.info-title {
  font-size: 18 * @pr;
  font-weight: bold;
}

.info-item {
  margin-top: 4 * @pr;
  font-size: 12 * @pr;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-item-name {
  white-space: nowrap;
  color: @antTextGrey;
}

.story-link {
  white-space: nowrap;
  color: @antBlue;
  font-size: 14 * @pr;
}

.content {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  padding-bottom: 16 * @pr;
}

.markdown-body {
  font-size: 15 * @pr;
  color: @antTextSemi;
}
</style>

<style lang="less">
@import '~@/styles/common';

.markdown-body img {
  height: auto;  // FIX: img标签指定了高度导致异常拉伸的问题
}
</style>
