<template>
  <div class="story-item" :class="{ 'story-item-ctrl': isCtrlKeyHold }">
    <div
      v-if="preview"
      class="story-preview-item"
      :class="{ 'story-preview-item-readed': isReaded && !isReading }"
      tabindex="0"
      role="link"
      @click="onPreviewOpen"
      @keydown.enter.prevent="onPreviewOpen"
      @keydown.space.prevent="onPreviewOpen"
    >
      <div class="story-preview-item-body">
        <div class="story-preview-item-head">
          <div ref="previewTitle" class="story-preview-item-title">{{ title }}</div>
          <div class="story-preview-item-date">{{ dateText }}</div>
        </div>
        <div class="story-preview-item-summary" :style="previewSummaryStyle">{{ previewSummary }}</div>
      </div>
    </div>
    <template v-else>
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
        <div class="story-preview-summary" @click="handleSummaryClick" :class="{
      'story-preview-summary-show-image': isShowImage,
      'story-preview-summary-ignore-image': isIgnoreImage,
    }">
          <div v-if="isShowImage" class="story-preview-image" :class="{ 'story-preview-image-loading': !isImageReady }">
            <img @load="onPreviewImageLoad" @error="onPreviewImageError" referrerpolicy="no-referrer" :src="imageUrl" />
          </div>
          {{ story.summary }}
        </div>
        <div class="story-preview-link" @click="goLink">
          <MoIconAngleRight3 class="story-preview-link-fade" />
          <MoIconAngleRight3 class="story-preview-link-main" />
          <MoIconAngleRight3 class="story-preview-link-fade" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'
import { formatDateFriendly } from '@/plugin/datefmt'
import MoIconAngleRight3 from '@/components/MoIconAngleRight3'
import * as ImageHelper from '@/plugin/image'
import { storyStore, isNewFirst } from '@/store/story'
import { feedStore } from '@/store/feed'
import { imageProxyStore } from '@/store/imageProxy'

function stripHtml(html) {
  if (_.isEmpty(html)) {
    return ''
  }
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

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
    solo: {
      type: Boolean,
      default: false,
    },
    preview: {
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
      previewSummaryLines: 3,
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
      let proxyUrl = imageProxyStore.urlForImage({
        src: src,
        token: this.story.image_token,
      })
      if (_.isNil(proxyUrl)) {
        return src
      }
      return proxyUrl
    },
    isShowImage() {
      return !_.isEmpty(this.imageUrl) && !this.story.is_image_duplicated
    },
    isIgnoreImage() {
      let hasToken = !_.isEmpty(this.story.image_token)
      let isProxyEnable = hasToken && imageProxyStore.isEnable
      let isImageFailed = !isProxyEnable && this.isImageNeedProxy
      return isImageFailed || this.isImageProxyFailed
    },
    routerLink() {
      return `/story?feed=${this.feedId}&offset=${this.offset}`
    },
    previewSummary() {
      if (!_.isEmpty(this.story.summary)) {
        return this.story.summary
      }
      return stripHtml(this.story.content)
    },
    previewSummaryStyle() {
      return {
        '-webkit-line-clamp': this.previewSummaryLines,
        'max-height': this.previewSummaryLines * 22 + 'px',
      }
    },
  },
  watch: {
    title() {
      if (this.preview) {
        this.updatePreviewSummaryLines()
      }
    },
    preview(value) {
      if (value) {
        this.updatePreviewSummaryLines()
      }
    },
  },
  mounted() {
    if (this.preview) {
      this.updatePreviewSummaryLines()
      window.addEventListener('resize', this.updatePreviewSummaryLines)
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updatePreviewSummaryLines)
  },
  methods: {
    updatePreviewSummaryLines() {
      this.$nextTick(() => {
        let el = this.$refs.previewTitle
        if (_.isNil(el)) {
          return
        }
        // 标题 1 行时摘要 3 行，标题 2 行时摘要 2 行；正文区始终 4 行。
        this.previewSummaryLines = el.getBoundingClientRect().height > 30 ? 2 : 3
      })
    },
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
        // 点标题/「>>>」进文章页也要记录当前位置，返回时才能恢复
        this.$emit('read')
        this.$router.push(this.routerLink)
      }
    },
    markReaded() {
      if (_.isEmpty(this.story.summary) || _.isEmpty(this.story.content)) {
        let promise = storyStore.load({
          feedId: this.feedId,
          offset: this.offset,
          detail: true,
          setReaded: !this.isReaded,
        })
        return {
          promise,
          wait: _.isEmpty(this.story.summary) && _.isEmpty(this.story.content),
        }
      } else if (!this.isReaded) {
        if (isNewFirst()) {
          return {
            promise: storyStore.setRead({ feedId: this.feedId, offset: this.offset, is_read: true }),
            wait: false,
          }
        } else {
          return {
            promise: feedStore.setStoryOffset({ feedId: this.feedId, offset: this.offset + 1 }),
            wait: false,
          }
        }
      }
      return { promise: null, wait: false }
    },
    async onOpen() {
      if (this.solo) {
        this.$emit('click')
        return
      }
      let { promise, wait } = this.markReaded()
      if (wait) {
        await promise
      }
      this.$emit('read')
      if (!this.isOpened && this.isCtrlKeyHold) {
        this.openLinkInNewTab()
      } else {
        this.$emit('update:isOpened', !this.isOpened)
      }
    },
    async onPreviewOpen() {
      if (this.solo) {
        this.$emit('click')
        return
      }
      let { promise } = this.markReaded()
      if (promise) {
        await promise
      }
      this.goLink()
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

  >img {
    display: block;
    width: 100%;
  }
}

.story-preview-image-loading {
  position: absolute;
  max-width: 15 * @pr;
}

.story-preview-summary-ignore-image .story-preview-image {
  width: 0;
  height: 0;
  padding: 0;
  margin-right: 0;
  margin-bottom: 0;
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

.story-item.reader-active .story-preview-item {
  /* 三栏读者模式下，当前文章的底色透出来 */
  background: transparent;
}

.story-preview-item {
  box-sizing: border-box;
  height: 122 * @pr;
  padding: 12 * @pr 16 * @pr 14 * @pr;
  background: #fff;
  cursor: pointer;
}

.story-preview-item-body {
  height: 96 * @pr;
  display: flex;
  flex-direction: column;
}

.story-preview-item-head {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.story-preview-item-title {
  flex: 1;
  min-width: 0;
  max-height: 44 * @pr;
  overflow: hidden;
  font-size: 15 * @pr;
  line-height: 22 * @pr;
  font-weight: 600;
  color: #000;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.story-preview-item-date {
  flex-shrink: 0;
  width: 44 * @pr;
  margin-left: 8 * @pr;
  font-size: 12 * @pr;
  line-height: 22 * @pr;
  text-align: right;
  color: @antTextGrey;
  white-space: nowrap;
}

.story-preview-item-summary {
  margin-top: 8 * @pr;
  overflow: hidden;
  font-size: 14 * @pr;
  line-height: 22 * @pr;
  color: @antTextSemi;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.story-preview-item-readed {

  .story-preview-item-title,
  .story-preview-item-summary {
    color: @antTextGrey;
  }

  .story-preview-item-date {
    color: @antTextLight;
  }
}

.story-preview-item:active {
  background: #f5f5f5;
}

.story-preview-item:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2 * @pr @antBlue;
}
</style>
