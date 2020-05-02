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
        <a
          class="info-item-content story-link"
          :href="story.link"
          target="_blank"
        >{{ storyLinkUnquoted }}</a>
      </div>
      <div class="info-item">
        <span class="info-item-name">发布时间：</span>
        <span class="info-item-content">{{ dateText }}</span>
      </div>
    </div>
    <div class="content" v-if="story">
      <div class="story-audio-wrapper" v-if="story.audio_url">
        <audio controls>
          <source :src="story.audio_url" />Your browser does not support the audio element.
        </audio>
      </div>
      <div class="story-iframe-wrapper" v-if="story.iframe_url">
        <div class="story-iframe-loading-wrapper">
          <div class="story-iframe-loading">Loading</div>
        </div>
        <iframe
          :src="story.iframe_url"
          scrolling="no"
          border="0"
          frameborder="no"
          framespacing="0"
          allowfullscreen="true"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
      <div id="story-markdown-body" class="markdown-body" v-story="storyContent"></div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
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
    storyLinkUnquoted() {
      if (_.isEmpty(this.story.link)) {
        return ''
      }
      return decodeURI(this.story.link)
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
    },
    storyContent() {
      if (_.isNil(this.story)) {
        return ''
      }
      return this.story.content
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
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-item-name {
  white-space: nowrap;
  color: @antTextGrey;
}

.info-item-content {
  overflow: hidden;
  text-overflow: ellipsis;
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

.story-audio-wrapper {
  audio {
    display: block;
    width: 100%;
    outline: none;
    margin-bottom: 16 * @pr;
  }
}

.story-iframe-wrapper {
  margin-bottom: 16 * @pr;
}

.story-iframe-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 宽高比16:9 */

  .story-iframe-loading-wrapper {
    position: absolute;
    z-index: 0;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .story-iframe-loading {
    text-align: center;
    font-size: 36px;
    line-height: 54px;
    height: 54px;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: bold;
    color: #ececec;
    opacity: 0.5;
  }

  iframe {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
}
</style>
