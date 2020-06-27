<template>
  <MoLayout grey header board>
    <MoHeader border board>
      <MoDebugTool class="title">蚁阅</MoDebugTool>
      <div class="right">
        <mu-button icon class="action-readed" @click="setAllReaded">
          <fa-icon class="action-icon" icon="check" />
        </mu-button>
        <mu-button
          ref="wizardTrigger"
          icon
          class="action-add"
          @click="()=>{this.$router.push('/feed-creation')}"
        >
          <fa-icon class="action-icon" icon="plus" />
        </mu-button>
        <mu-popover
          class="wizard"
          :class="{'wizard-hidden':!isActive}"
          :open.sync="openWizard"
          :trigger="wizardTrigger"
          placement="bottom"
        >
          <span class="wizard-triangle"></span>
          <div class="wizard-info">点这里添加订阅</div>
        </mu-popover>
        <mu-menu
          placement="bottom"
          class="action-menu"
          :open.sync="isMenuOpen"
          :popover-class="isActive?'menu-popover':'menu-popover-hidden'"
        >
          <mu-button icon class="action-menu-button">
            <fa-icon class="action-icon" icon="bars" />
          </mu-button>
          <mu-list slot="content" class="menu-list">
            <mu-list-item button @click="exportOPML">
              <mu-list-item-title>导出订阅</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="goFeedClean">
              <mu-list-item-title>清理订阅</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="goFeedFavorited">
              <mu-list-item-title>我的收藏</mu-list-item-title>
            </mu-list-item>
          </mu-list>
        </mu-menu>
        <mu-avatar size="32" class="user" @click="()=>{this.$router.push('/account')}">
          <img :src="avatar" />
        </mu-avatar>
      </div>
    </MoHeader>
    <div class="main">
      <div class="list-placeholder-wrapper" v-if="!isReady">
        <div class="list-placeholder spinner">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
      </div>
      <transition name="fade" v-if="isReady && isEmpty">
        <div class="empty-placeholder-wrapper">
          <div class="empty-placeholder">
            <span>
              <span>点击上方</span>
              <fa-icon class="icon-add" icon="plus" />
              <span>号</span>
            </span>
            <br />
            <span>轻松订阅</span>
          </div>
        </div>
      </transition>
      <transition-group
        class="list list-upper"
        name="list"
        tag="div"
        :style="{ height: virtualUpperHeight + 'px' }"
      >
        <VirtualItem
          v-for="item in virtualUpperList"
          :key="item.id"
          :feed="item.feed"
          :story="item.story"
        ></VirtualItem>
      </transition-group>
      <transition-group
        class="list list-lower"
        name="list"
        tag="div"
        :style="{ height: virtualLowerHeight + 'px' }"
      >
        <VirtualItem
          v-for="item in virtualLowerList"
          :key="item.id"
          :feed="item.feed"
          :story="item.story"
        ></VirtualItem>
      </transition-group>
    </div>
    <template v-slot:board>
      <div>board</div>
    </template>
    <!-- pre-load muse-ui icons -->
    <mu-icon value="favorite" v-if="isReady" style="position:fixed;top:-100px;" />
    <!-- end pre-load muse-ui icons -->
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import Vue from 'vue'
import MoHeader from '@/components/MoHeader'
import MoLayout from '@/components/MoLayout'
import MoDebugTool from '@/components/MoDebugTool'
import MoFeedItem from '@/components/MoFeedItem.vue'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'

import initMathjax from '@/plugin/mathjax'
import defaultAvatar from '@/assets/avatar.svg'
import { antRippleGrey } from '@/plugin/common'

const ITEM_HEIGHT = 48
const PAGE_SIZE = Math.ceil(window.innerHeight / ITEM_HEIGHT)

const VirtualItem = Vue.component('VirtualItem', {
  props: {
    feed: {
      type: Object,
    },
    story: {
      type: Object,
    },
  },
  methods: {
    getFeedTitle(feedId) {
      return this.$API.feed.get(feedId).title
    },
    isReaded(story) {
      return this.$API.story.isReaded(story)
    },
  },
  render(h) {
    let feed = this.feed
    let story = this.story
    if (!_.isNil(feed)) {
      return h(MoFeedItem, {
        props: {
          title: feed.title,
          number: feed.num_unread_storys,
          date: feed.dt_latest_story_published || feed.dt_created,
          link: `/feed/${feed.id}`,
        },
      })
    } else {
      return h(MoFeedStoryItem, {
        props: {
          feedId: story.feed.id,
          offset: story.offset,
          feedTitle: this.getFeedTitle(story.feed.id),
          storyTitle: story.title,
          storyDate: story.dt_published,
          isReaded: this.isReaded(story),
        },
      })
    }
  },
})

export default {
  name: 'MoHomePage',
  components: { MoHeader, MoLayout, MoDebugTool, VirtualItem },
  props: {
    vid: {
      type: String,
      default: '/',
    },
  },
  data() {
    return {
      isActive: true,
      rippleColor: antRippleGrey,
      openWizard: false,
      wizardTrigger: null,
      isMenuOpen: false,
      isReady: false,
      virtualUpperHeight: 0,
      virtualUpperList: [],
      virtualLowerHeight: 0,
      virtualLowerList: [],
    }
  },
  computed: {
    avatar() {
      let user = this.$API.user.loginUser
      if (_.isNil(user) || _.isEmpty(user.avatar_url)) {
        return defaultAvatar
      } else {
        return user.avatar_url
      }
    },
    mushrooms() {
      return this.$API.story.mushrooms
    },
    feedList() {
      return this.$API.feed.feedList
    },
    isEmpty() {
      return _.isNil(this.feedList) || this.feedList.length <= 0
    },
  },
  mounted() {
    this.wizardTrigger = this.$refs.wizardTrigger.$el
    this.$API.syncFeedLoadMushrooms().then(() => {
      this.openWizard = this.isEmpty
      this.isReady = true
      this.renderVirtualList()
      this.$watch('feedList', () => {
        this.updateVirtualList()
      })
      initMathjax()
    })
  },
  activated() {
    this.openWizard = this.isReady && this.isEmpty
    this.isActive = true
  },
  deactivated() {
    this.openWizard = false
    this.isMenuOpen = false
    this.isActive = false
  },
  savePageState() {
    this.$pageState.set('scrollTop', window.scrollY)
    this.$pageState.commit()
  },
  methods: {
    numTextOf(n) {
      return n > 0 ? n : ''
    },
    exportOPML() {
      this.$API.feed.exportOPML({ download: true })
    },
    goFeedClean() {
      this.$router.push('/feed-clean')
    },
    goFeedFavorited() {
      this.$router.push('/favorited')
    },
    setAllReaded() {
      let feedIds = this.feedList.map(x => x.id)
      this.$API.feed.setAllReaded({ feedIds })
    },
    isReaded(story) {
      return this.$API.story.isReaded(story)
    },
    _upperSize() {
      let upperSize = 0
      for (var i = 0; i < this.mushrooms.length; i++) {
        if (!this.isReaded(this.mushrooms[i])) {
          break
        }
        upperSize += 1
      }
      return upperSize
    },
    _virtualLayout(bufferList) {
      // setup layout height
      let upperSize = this._upperSize()
      let lowerSize = bufferList.length - upperSize
      let virtualUpperHeight = Math.max(0, upperSize * ITEM_HEIGHT - 8)
      let virtualLowerHeight = lowerSize * ITEM_HEIGHT
      return {
        upperSize,
        lowerSize,
        virtualUpperHeight,
        virtualLowerHeight,
      }
    },
    _virtualListBuffer() {
      // prepare virtual list data
      let result = []
      _.forEach(this.mushrooms, story => {
        let item = {
          id: `${story.feed.id}:${story.offset}`,
          story: story,
          visible: false,
        }
        result.push(item)
      })
      _.forEach(this.feedList, feed => {
        let item = {
          id: feed.id,
          feed: feed,
          visible: false,
        }
        result.push(item)
      })
      return result
    },
    updateVirtualList() {
      let bufferList = this._virtualListBuffer()
      let { upperSize, virtualUpperHeight, virtualLowerHeight } = this._virtualLayout(bufferList)
      let virtualUpperList = []
      let virtualLowerList = []
      for (var i = 0; i < upperSize; i++) {
        virtualUpperList.push(bufferList[i])
      }
      for (var j = upperSize; j < bufferList.length; j++) {
        virtualLowerList.push(bufferList[j])
      }
      this.virtualUpperHeight = virtualUpperHeight
      this.virtualLowerHeight = virtualLowerHeight
      this.virtualUpperList = virtualUpperList
      this.virtualLowerList = virtualLowerList
    },
    renderVirtualList() {
      let bufferList = this._virtualListBuffer()
      // setup layout height
      let { upperSize, virtualUpperHeight, virtualLowerHeight } = this._virtualLayout(bufferList)
      this.virtualUpperList = []
      this.virtualLowerList = []
      this.virtualUpperHeight = virtualUpperHeight
      this.virtualLowerHeight = virtualLowerHeight
      // setup scroll position
      let scrollTop = this.$pageState.get('scrollTop')
      if (_.isNil(scrollTop) || scrollTop <= 0) {
        scrollTop = this.virtualUpperHeight
      }
      let upperIndex = upperSize - 1
      let lowerIndex = upperSize
      // render first page quickly
      let renderFirstPage = () => {
        for (var i = 0; i < PAGE_SIZE; i++) {
          if (lowerIndex >= bufferList.length) {
            break
          }
          let item = bufferList[lowerIndex]
          this.virtualLowerList.push(item)
          lowerIndex += 1
        }
      }
      // render data in batchs to avoid freeze browser
      let batchSize = 15
      let step = () => {
        let stop = false
        for (var i = 0; i < batchSize; i++) {
          let hasLower = lowerIndex < bufferList.length
          let hasUpper = upperSize > 0 && upperIndex >= 0
          if (!hasLower && !hasUpper) {
            stop = true
            break
          }
          if (hasLower) {
            let item = bufferList[lowerIndex]
            this.virtualLowerList.push(item)
            lowerIndex += 1
          }
          if (hasUpper) {
            let item = bufferList[upperIndex]
            this.virtualUpperList.push(item)
            upperIndex -= 1
          }
        }
        if (!stop) {
          requestAnimationFrame(step)
        }
      }
      // 1. update scroll position
      // 2. render first page
      // 3. render other pages in batches
      setTimeout(() => {
        window.scrollTo(0, scrollTop)
        renderFirstPage()
        setTimeout(() => {
          requestAnimationFrame(step)
        }, 0)
      }, 0)
    },
  },
}
</script>

<style lang="less">
@import '~@/styles/common';

.menu-popover-hidden,
.menu-popover {
  top: 48 * @pr !important;
  .menu-list .mu-item {
    height: 40 * @pr;
  }
}

.menu-popover-hidden {
  display: none;
}
</style>

<style lang="less" scoped>
@import '~@/styles/common';

.title {
  color: @antTextBlack;
  font-weight: bold;
  font-size: 16 * @pr;
}

.right {
  display: flex;
}

.user {
  width: 32 * @pr;
  height: 32 * @pr;
}

.action-readed,
.action-add,
.action-menu,
.action-menu-button {
  width: 32 * @pr;
  height: 32 * @pr;
  margin-right: 16 * @pr;
  color: @antTextSemi;
}

.wizard {
  margin-top: 8px;
  box-shadow: none;
  background-color: @antBackDark;
  opacity: 0.9;
  overflow: visible;
  cursor: default;
}

.wizard-hidden {
  display: none;
}

.wizard.mu-popover.transition-bottom {
  transform: none;
  &.mu-popover-transition-enter {
    transform: translate3d(0, 10%, 0);
  }
  &.mu-popover-transition-leave-to {
    transform: none;
  }
  &.mu-popover-transition-enter,
  &.mu-popover-transition-leave-to {
    opacity: 0;
  }
  &.mu-popover-transition-enter-active,
  &.mu-popover-transition-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
    backface-visibility: hidden;
  }
}

.wizard-info {
  font-size: 10px;
  line-height: 22px;
  padding: 4px 8px;
  color: @antTextWhite;
  border-radius: 2px;
}

.wizard-triangle {
  // https://juejin.im/post/5cdc0458f265da03a1584fd0
  display: block;
  height: 14px;
  width: 14px;
  background-color: inherit;
  border: inherit;
  position: absolute;
  top: -6px;
  left: calc(50% - 7px);
  // ---start---
  clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
  transform: rotate(135deg);
  // ---end---
  border-radius: 0 0 0 2px;
}

.main {
  // header border height
  margin-top: -1 * @pr;
}

.menu-list {
  padding: 0 0;
}

.menu-list .mu-item-title {
  font-size: 15 * @pr;
}

.list .feed-story-item,
.list .feed-item {
  margin-top: 8 * @pr;
}

.list-upper {
  display: flex;
  flex-direction: column-reverse;
}

.empty-placeholder-wrapper,
.list-placeholder-wrapper {
  position: fixed;
  top: 48 * @pr;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.empty-placeholder,
.list-placeholder {
  margin: auto;
  opacity: 0.33;
}

.empty-placeholder {
  font-size: 36 * @pr;
  font-family: Helvetica, Arial, sans-serif;
  color: darken(@antBackGrey, 20%);
  text-align: center;

  .icon-add {
    display: inline-block;
    font-size: 40 * @pr;
    margin-left: 4px;
    margin-right: 4px;
    color: @antTextSemi;
  }
}

/** https://tobiasahlin.com/spinkit/ */
.spinner {
  width: 70px;
  text-align: center;
}

.spinner > div {
  width: 18px;
  height: 18px;
  background-color: darken(@antBackGrey, 20%);

  border-radius: 100%;
  display: inline-block;
  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

@-webkit-keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
  }
}

@keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 1s ease;
}

.list-enter,
.list-leave-to {
  opacity: 0;
}
</style>
