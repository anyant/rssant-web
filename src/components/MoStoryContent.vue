<template>
  <div class="story-content">
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
        <MoAudioPlayer :src="story.audio_url"></MoAudioPlayer>
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
  </div>
</template>

<script>
import _ from 'lodash'
import { formatFullDateFriendly } from '@/plugin/datefmt'
import initMathjax from '@/plugin/mathjax'
import MoAudioPlayer from '@/components/MoAudioPlayer'

export default {
  components: { MoAudioPlayer },
  props: {
    story: Object,
  },
  computed: {
    storyLinkUnquoted() {
      if (_.isEmpty(this.story.link)) {
        return ''
      }
      return decodeURI(this.story.link)
    },
    dateText() {
      if (_.isNil(this.story)) {
        return ''
      }
      return formatFullDateFriendly(this.story.dt_published)
    },
    storyContent() {
      if (_.isNil(this.story)) {
        return ''
      }
      return this.story.content
    },
  },
  mounted() {
    initMathjax()
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

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
    font-size: 36 * @pr;
    line-height: 54 * @pr;
    height: 54 * @pr;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: bold;
    color: @antBackGrey;
    opacity: 0.5;
    cursor: default;
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