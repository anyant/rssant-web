<template>
  <div class="story-content">
    <div class="story-wrapper" :style="wrapperStyle">
      <div class="story-info" v-if="story">
        <div id="story-info-title" class="info-title" v-story="titleForRender"></div>
        <div class="info-item">
          <span class="info-item-name">原文：</span>
          <a class="info-item-content story-link" :href="story.link" target="_blank">{{ storyLinkUnquoted }}</a>
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
          <iframe :src="story.iframe_url" scrolling="no" border="0" frameborder="no" framespacing="0"
            allowfullscreen="true" referrerpolicy="no-referrer"></iframe>
        </div>
        <div id="story-markdown-body" class="markdown-body" v-story="storyForRender"></div>
      </div>
    </div>
    <transition name="fade">
      <div v-if="nextStory" class="next-story">
        <div class="next-story-label">
          <div class="next-story-label-line"></div>
          <div class="next-story-label-value">下一篇</div>
          <div class="next-story-label-line"></div>
        </div>
        <a class="next-story-link" @click.prevent="openNextStory">{{ nextTitle }}</a>
      </div>
    </transition>
  </div>
</template>

<script>
import _ from 'lodash'
import { formatFullDateFriendly } from '@/plugin/datefmt'
import initMathjax from '@/plugin/mathjax'
import * as ImageHelper from '@/plugin/image'
import MoAudioPlayer from '@/components/MoAudioPlayer'
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import { imageProxyStore } from '@/store/imageProxy'

export default {
  components: { MoAudioPlayer },
  props: {
    story: Object,
    nextFeed: Object,
    nextStory: Object,
    gotoNextStory: Function,
    showNextFeedTitle: Boolean,
    imageViewerContainerGetter: Function,
  },
  data() {
    return {}
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
    link() {
      return _.isNil(this.story) ? '' : this.story.link
    },
    imageToken() {
      return _.isNil(this.story) ? '' : this.story.image_token
    },
    titleForRender() {
      let content = _.isNil(this.story) ? '' : this.story.title
      return { content, link: this.link }
    },
    storyForRender() {
      let content = _.isNil(this.story) ? '' : this.story.content
      return { content, link: this.link, callback: this.onStoryRendered.bind(this) }
    },
    wrapperStyle() {
      return {
        minHeight: `${this.$LAYOUT.windowInnerHeight - 48}px`,
      }
    },
    nextTitle() {
      if (_.isNil(this.nextStory)) {
        return ''
      }
      let feedTitle = null
      if (this.showNextFeedTitle && !_.isNil(this.nextFeed)) {
        feedTitle = this.nextFeed.title
      }
      let storyTitle = this.nextStory.title || decodeURI(this.nextStory.link)
      if (!_.isEmpty(feedTitle)) {
        return `${feedTitle} - ${storyTitle}`
      } else {
        return storyTitle
      }
    },
  },
  mounted() {
    initMathjax()
  },
  methods: {
    onStoryRendered(dom) {
      this.setupImageProxy(dom)
      this.setupImageViewer(dom)
      this.setupVideoFallback(dom)
    },
    setupVideoFallback(dom) {
      let videoNodes = dom.querySelectorAll('video')
      videoNodes.forEach((node) => {
        let src = node.getAttribute('src')
        if (_.isEmpty(src)) {
          node.removeAttribute('src')
          return
        }
        src = ImageHelper.makeAbsoluteUrl(src, this.link)
        if (ImageHelper.isSameOriginUrl(src)) {
          return
        }
        node.setAttribute('src', src)
        node.onerror = () => {
          let newNode = document.createElement('a')
          newNode.setAttribute('href', node.src)
          newNode.setAttribute('referrerpolicy', 'no-referrer')
          newNode.setAttribute('rel', 'noreferrer')
          newNode.setAttribute('target', '_blank')
          newNode.innerText = node.src
          node.parentNode.replaceChild(newNode, node)
        }
      })
    },
    setupImageProxy(dom) {
      let imageNodes = dom.querySelectorAll('img,source')
      imageNodes.forEach((node) => {
        let src = ImageHelper.fixImageSrc(node, this.link)
        if (_.isEmpty(src) || ImageHelper.isDataUrl(src) || ImageHelper.isSameOriginUrl(src)) {
          return
        }
        node.setAttribute('referrerpolicy', 'no-referrer')
        node.setAttribute('loading', 'lazy')
        node.onerror = () => {
          this.onImageError(node)
        }
      })
    },
    onImageError(node) {
      if (_.isEmpty(this.imageToken)) {
        return
      }
      if (ImageHelper.isSameOriginUrl(node.src)) {
        return
      }
      if (ImageHelper.isProxyedImage(node)) {
        return
      }
      let url = imageProxyStore.urlForImage({
        src: node.src,
        token: this.imageToken,
      })
      ImageHelper.setupProxyForImage(node, url)
    },
    setupImageViewer(dom) {
      let imageNodes = dom.querySelectorAll('img,source')
      imageNodes.forEach((node) => {
        if (_.isEmpty(node.src)) {
          return
        }
        if (ImageHelper.isLinkImage(node)) {
          return
        }
        node.style.cursor = 'zoom-in'
        node.addEventListener('click', (event) => {
          event.preventDefault()
          this.onViewImage(node)
        })
      })
    },
    onViewImage(node) {
      // viewerjs will copy image attrbutes, and loading="lazy" may
      // cause image not show in firefox (mobile simulation)
      node.removeAttribute('loading')
      // on iOS mobile, fixed element (image container) can not outside this component
      // so need story page pass the container down to ensure correct display
      let container = null
      if (!_.isNil(this.imageViewerContainerGetter)) {
        container = this.imageViewerContainerGetter()
      }
      const viewer = new Viewer(node, {
        navbar: false,
        toolbar: false,
        title: false,
        keyboard: false,
        loading: false,
        container: container,
        hidden() {
          viewer.destroy()
        },
      })
      viewer.show(true)
    },
    openNextStory() {
      if (_.isNil(this.nextStory)) {
        return
      }
      if (!_.isNil(this.gotoNextStory)) {
        this.gotoNextStory()
        return
      }
      let feedId = this.nextStory.feed.id
      let offset = this.nextStory.offset
      let link = `/story?feed=${feedId}&offset=${offset}`
      this.$router.replace({ path: link })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

@nextStoryLinkHeight: 120 * @pr;

.story-wrapper {
  min-height: 100vh;
  padding-bottom: @nextStoryLinkHeight;
}

.story-info {
  padding: 16 * @pr;
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
  line-height: 1.25;
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
  padding-bottom: 56.25%;
  /* 宽高比16:9 */

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

.next-story {
  margin-top: -@nextStoryLinkHeight;
  padding: 16 * @pr;
  overflow: hidden;
}

.next-story-label {
  margin-top: 12 * @pr;
  margin-bottom: 12 * @pr;
  display: flex;
  align-items: center;
  cursor: default;

  .next-story-label-value {
    padding-left: 8 * @pr;
    padding-right: 8 * @pr;
    color: @antTextGrey;
  }

  .next-story-label-line {
    flex: 1;
    height: 0;
    border-bottom: 1 * @pr solid @antLineGrey;
  }
}

.next-story-link {
  display: block;
  text-align: center;
  font-size: 15 * @pr;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-top: 4 * @pr;
  padding-bottom: 4 * @pr;
  color: @antBlue;
  cursor: pointer;
}

.fade-enter-active {
  transition: opacity 3s ease;
}

.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>