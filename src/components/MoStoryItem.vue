<template>
  <div class="story-item" :class="{ 'story-item-ctrl': isCtrlKeyHold }">
    <div class="story-header" :class="{ 'story-header-readed': isReaded }" v-if="!isOpened" @click="onOpen">
      <div class="story-title">{{ title }}</div>
      <div class="story-date">{{ dateText }}</div>
    </div>
    <div class="story-preview" :class="{ 'story-preview-readed': isReaded && !isReading }" v-if="isOpened">
      <div class="story-preview-header" @click="onOpen">
        <div class="story-preview-title">{{ title }}</div>
        <mu-button icon class="story-favorited" @click.stop="toggleFavorited">
          <fa-icon size="18" v-if="isFavorited" icon="star" :color="starColor" />
          <fa-icon size="18" v-else icon="far/star" :color="starColor" />
        </mu-button>
      </div>
      <div
        class="story-preview-summary"
        @click="handleSummaryClick"
        :class="{
          'story-preview-summary-show-image': isShowImage,
          'story-preview-summary-ignore-image': isIgnoreImage,
        }"
      >
        <img
          v-if="isShowImage"
          @load="onPreviewImageLoad"
          @error="onPreviewImageError"
          referrerpolicy="no-referrer"
          class="story-preview-image"
          :class="{ 'story-preview-image-loading': !isImageReady }"
          :src="imageUrl"
        />
        {{ story.summary }}
      </div>
      <div class="story-preview-link" @click="goLink">
        <MoIconAngleRight3 class="story-preview-link-fade" />
        <MoIconAngleRight3 class="story-preview-link-main" />
        <MoIconAngleRight3 class="story-preview-link-fade" />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'
import { formatDateFriendly } from '@/plugin/datefmt'
import MoIconAngleRight3 from '@/components/MoIconAngleRight3'
import * as ImageHelper from '@/plugin/image'
import { storyStore } from '@/store/story'
import { feedStore } from '@/store/feed'

export default {
  components: { MoIconAngleRight3 },
  props: {
    isOpened: {
      type: Boolean,
      default: false,
    },
    isReaded: {
      type: Boolean,
      default: false,
    },
    isReading: {
      type: Boolean,
      default: false,
    },
    isFavorited: {
      type: Boolean,
      default: false,
    },
    isCtrlKeyHold: {
      type: Boolean,
      default: false,
    },
    feedId: {
      type: String,
      required: true,
    },
    offset: {
      type: Number,
      required: true,
    },
    story: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isImageReady: false,
      isImageNeedProxy: false,
      isImageProxyFailed: false,
    }
  },
  computed: {
    title() {
      return this.story.title || this.story.link
    },
    dateText() {
      return formatDateFriendly(this.story.dt_published)
    },
    starColor() {
      if (this.isFavorited) {
        return antGold
      } else {
        return null
      }
    },
    imageUrl() {
      let src = this.story.image_url
      if (_.isEmpty(src) || _.isEmpty(this.story.image_token)) {
        return src
      }
      if (!this.isImageNeedProxy || ImageHelper.isSameOriginUrl(src)) {
        return src
      }
      let proxyUrl = new URL('/api/v1/image/proxy', location.origin)
      proxyUrl.searchParams.set('url', src)
      proxyUrl.searchParams.set('token', this.story.image_token)
      return proxyUrl.toString()
    },
    isShowImage() {
      return !_.isEmpty(this.imageUrl) && !this.story.is_image_duplicated
    },
    isIgnoreImage() {
      let isImageFailed = _.isEmpty(this.story.image_token) && this.isImageNeedProxy
      return isImageFailed || this.isImageProxyFailed
    },
    routerLink() {
      return `/story?feed=${this.feedId}&offset=${this.offset}`
    },
  },
  methods: {
    onPreviewImageLoad() {
      this.isImageReady = true
    },
    onPreviewImageError() {
      if (this.isImageNeedProxy) {
        this.isImageProxyFailed = true
      } else {
        this.isImageNeedProxy = true
      }
    },
    toggleFavorited() {
      this.$emit('toggleFavorited')
    },
    handleSummaryClick() {
      if (this.isCtrlKeyHold) {
        this.openLinkInNewTab()
      }
    },
    openLinkInNewTab() {
      if (!_.isEmpty(this.story.link)) {
        window.open(this.story.link, '_blank')
      } else if (!_.isEmpty(this.routerLink)) {
        this.$router.push(this.routerLink)
      }
    },
    goLink() {
      let isPoorContent = _.isEmpty(this.story.content) || this.story.content.length <= 20
      if (!_.isEmpty(this.story.link) && (this.isCtrlKeyHold || isPoorContent)) {
        this.openLinkInNewTab()
      } else if (!_.isEmpty(this.routerLink)) {
        this.$router.push(this.routerLink)
      }
    },
    async onOpen() {
      if (_.isEmpty(this.story.summary) || _.isEmpty(this.story.content)) {
        let promise = storyStore.load({
          feedId: this.feedId,
          offset: this.offset,
          detail: true,
          setReaded: !this.isReaded,
        })
        if (_.isEmpty(this.story.summary) && _.isEmpty(this.story.content)) {
          await promise
        }
      } else if (!this.isReaded) {
        feedStore.setStoryOffset({ feedId: this.feedId, offset: this.offset + 1 })
      }
      this.$emit('read')
      if (!this.isOpened && this.isCtrlKeyHold) {
        this.openLinkInNewTab()
      } else {
        this.$emit('update:isOpened', !this.isOpened)
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.story-item {
  background: #fff;
}

.story-header,
.story-preview {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
}

.story-header {
  position: relative;
  height: 40 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.story-header-readed {
  .story-title,
  .story-date {
    color: @antTextGrey;
    opacity: 0.6;
  }
}

.story-preview-readed {
  opacity: 0.42;
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

.story-preview {
  padding-top: 9 * @pr;
  padding-bottom: 1 * @pr;
  position: relative;
}

.story-preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.story-preview-title {
  line-height: 23 * @pr;
  font-size: 15 * @pr;
  font-weight: bold;
  padding-right: 28 * @pr;
}

.story-preview-summary {
  position: relative;
  padding-top: 8 * @pr;
  max-height: (14 * 22 + 8) * @pr;
  overflow: hidden;
  line-height: 22 * @pr;
  font-size: 15 * @pr;
}

.story-preview-summary-show-image {
  min-height: 24 * @pr;
}

.story-preview-image {
  max-width: 150 * @pr;
  float: left;
  margin-right: 16 * @pr;
  margin-top: 4 * @pr;
  margin-bottom: 4 * @pr;
}

.story-preview-image-loading {
  position: absolute;
  max-width: 15 * @pr;
}

.story-preview-summary-ignore-image .story-preview-image {
  width: 1px;
  height: 1px;
  padding: 0;
  margin: 0;
}

.story-item-ctrl .story-preview-summary:hover {
  cursor: pointer;
}

.story-favorited {
  flex-shrink: 0;
  position: absolute;
  top: 3 * @pr;
  right: 12 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
}

.story-preview-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6 * @pr;
  padding-bottom: 3 * @pr;
  margin-top: -4 * @pr;
  cursor: pointer;

  .story-preview-link-main {
    color: @antBlue;
  }
  .story-preview-link-fade {
    color: @antLineGrey;
  }
}

.story-header,
.story-preview-header {
  cursor: pointer;
}
</style>