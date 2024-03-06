<template>
  <div>
    <MoHeader border board v-show="showHeader">
      <MoDebugTool class="title">蚁阅</MoDebugTool>
      <div class="right">
        <MoReadedButton @click="setAllReaded" class="action-readed"></MoReadedButton>
        <mu-button
          ref="wizardTrigger"
          icon
          class="action-add"
          @click="()=>{this.routeTo('/feed-creation')}"
        >
          <fa-icon class="action-icon" icon="plus" />
        </mu-button>
        <MoHeaderTip :open.sync="openWizard" :trigger="wizardTrigger" content="点这里添加订阅" />
        <mu-button ref="actionMenuRef" icon class="action-menu" @click="toggleMenu">
          <fa-icon class="action-icon" icon="bars" />
          <span v-if="showMenuAccountDot || showMenuHelpDot" class="action-menu-dot"></span>
        </mu-button>
        <transition name="mu-fade-transition">
          <mu-list ref="actionMenuListRef" class="action-menu-list" v-show="isMenuOpen">
            <mu-list-item button @click="goAccount">
              <mu-list-item-title>账号设置</mu-list-item-title>
              <span v-if="showMenuAccountDot" class="action-menu-account-dot"></span>
            </mu-list-item>
            <mu-list-item button @click="goFeedClean">
              <mu-list-item-title>整理订阅</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="goFeedFavorited">
              <mu-list-item-title>我的收藏</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="goPublishConfig">
              <mu-list-item-title>发布订阅</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="goHelp">
              <mu-list-item-title>蚁阅锦囊</mu-list-item-title>
              <span v-if="showMenuHelpDot" class="action-menu-help-dot"></span>
            </mu-list-item>
          </mu-list>
        </transition>
      </div>
    </MoHeader>
    <div class="main" ref="mainRef">
      <div class="list-placeholder-wrapper" v-if="!isReady">
        <div class="list-placeholder spinner">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
      </div>
      <transition name="mu-fade-transition" v-if="isReady && isEmpty">
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
        <MoFeedVirtualItem
          v-for="item in virtualUpperList"
          :key="item.id"
          :feed="item.feed"
          :group="item.group"
          :routeTo="routeTo"
          @click.native.capture="setActiveItem(item.id)"
          :class="{'active-item': isActiveItem(item.id)}"
        ></MoFeedVirtualItem>
      </transition-group>
      <transition-group
        class="list list-lower"
        name="list"
        tag="div"
        :style="{ height: virtualLowerHeight + 'px' }"
      >
        <MoFeedVirtualItem
          v-for="item in virtualLowerList"
          :key="item.id"
          :feed="item.feed"
          :group="item.group"
          :routeTo="routeTo"
          @click.native.capture="setActiveItem(item.id)"
          :class="{'active-item': isActiveItem(item.id)}"
        ></MoFeedVirtualItem>
      </transition-group>
    </div>
    <!-- pre-load muse-ui icons -->
    <mu-icon value="favorite" v-if="isReady" style="position:fixed;top:-100px;" />
    <!-- end pre-load muse-ui icons -->
  </div>
</template>
<script>
import _ from 'lodash'
import MoHeader from '@/components/MoHeader'
import MoDebugTool from '@/components/MoDebugTool'
import MoFeedVirtualItem from '@/components/MoFeedVirtualItem.vue'
import MoReadedButton from '@/components/MoReadedButton.vue'
import MoHeaderTip from '@/components/MoHeaderTip.vue'

import initMathjax from '@/plugin/mathjax'
import localConfig from '@/plugin/localConfig'
import { antRippleGrey } from '@/plugin/common'
import { userStore } from '@/store/user'
import { storyStore } from '@/store/story'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

const ITEM_HEIGHT = 48
const PAGE_SIZE = Math.ceil(window.innerHeight / ITEM_HEIGHT)

export default {
  components: { MoHeader, MoDebugTool, MoFeedVirtualItem, MoReadedButton, MoHeaderTip },
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
      activeItemKey: null,
      virtualUpperHeight: 0,
      virtualUpperList: [],
      virtualLowerHeight: 0,
      virtualLowerList: [],
      isHelpReaded: localConfig.HELP_READED.get(),
    }
  },
  computed: {
    groups() {
      if (this.isEmpty) {
        return []
      }
      let ret = []
      _.forEach(feedStore.feedGroups, group => {
        let groupName = encodeURIComponent(group.name)
        ret.push({
          title: group.name,
          link: `/group?name=${groupName}`,
          getNumber: () => feedStore.numUnreadOfGroup(group),
          getDate: () => feedStore.latestDateOfGroup(group),
        })
      })
      let mushroomsOfHome = storyStore.mushroomsOfHome
      let mushroomGroup = {
        title: '品读',
        link: '/mushroom',
        getNumber: () => storyStore.numUnreadOf(mushroomsOfHome),
        getDate: () => storyStore.latestDateOf(mushroomsOfHome),
      }
      if (mushroomGroup.getNumber() <= 0) {
        ret.splice(0, 0, mushroomGroup)
      } else {
        // insert mushroomGroup after all readed groups
        let pos = 0
        for (let g of ret) {
          if (g.getNumber() <= 0) {
            pos += 1
          }
        }
        ret.splice(pos, 0, mushroomGroup)
      }
      return ret
    },
    feedList() {
      return feedStore.homeFeedList
    },
    isEmpty() {
      return feedStore.numFeeds <= 0
    },
    showHeader() {
      return this.isReady || !this.$LAYOUT.hasBoard
    },
    showMenuAccountDot() {
      return this.isReady && !this.isEmpty && userStore.shouldNoticeVip
    },
    showMenuHelpDot() {
      return this.isReady && !this.isEmpty && !this.isHelpReaded
    },
    replaceRouter() {
      return this.$LAYOUT.hasBoard && this.$route.path !== '/'
    },
  },
  mounted() {
    this.wizardTrigger = this.$refs.wizardTrigger.$el
    rootStore.syncFeedLoadMushrooms().then(() => {
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
    this.$pageState.restoreScrollTop({ el: this.$refs.mainRef })
  },
  deactivated() {
    this.openWizard = false
    this.isMenuOpen = false
    this.isActive = false
  },
  savePageState() {
    if (this.$pageState.saveScrollTop({ el: this.$refs.mainRef })) {
      this.$pageState.commit()
    }
  },
  methods: {
    numTextOf(n) {
      return n > 0 ? n : ''
    },
    routeTo(path) {
      if (this.$route.fullPath === path) {
        return
      }
      if (this.replaceRouter) {
        this.$router.replace(path)
      } else {
        this.$router.push(path)
      }
    },
    setActiveItem(key) {
      this.activeItemKey = key
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
      if (this.isMenuOpen) {
        window.addEventListener('click', this.handleClickOutsideMenu)
      } else {
        window.removeEventListener('click', this.handleClickOutsideMenu)
      }
    },
    handleClickOutsideMenu(event) {
      let actionMenuRef = this.$refs.actionMenuRef
      let actionMenuListRef = this.$refs.actionMenuListRef
      if (!_.isNil(actionMenuRef) && !_.isNil(actionMenuListRef)) {
        if (actionMenuRef.$el.contains(event.target) || actionMenuListRef.$el.contains(event.target)) {
          return
        }
      }
      this.isMenuOpen = false
      window.removeEventListener('click', this.handleClickOutsideMenu)
    },
    goAccount() {
      this.routeTo('/account')
      this.isMenuOpen = false
    },
    goFeedClean() {
      this.routeTo('/feed-clean')
      this.isMenuOpen = false
    },
    goFeedFavorited() {
      this.routeTo('/favorited')
      this.isMenuOpen = false
    },
    goPublishConfig(){
      this.routeTo('/publish-config')
      this.isMenuOpen = false
    },
    goHelp() {
      this.routeTo('/help')
      this.isMenuOpen = false
      if (!this.isHelpReaded) {
        localConfig.HELP_READED.set(true)
        this.isHelpReaded = true
      }
    },
    setAllReaded() {
      let feedIds = feedStore.feedIds
      feedStore.setAllReaded({ feedIds })
    },
    isReaded(story) {
      return storyStore.isReaded(story)
    },
    isActiveItem(key) {
      if (_.isNil(this.activeItemKey) || !this.$LAYOUT.hasBoard) {
        return false
      }
      return this.activeItemKey === key
    },
    _upperSize() {
      let upperSize = 0
      for (var i = 0; i < this.groups.length; i++) {
        if (this.groups[i].getNumber() > 0) {
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
      let virtualUpperHeight = Math.max(0, upperSize * ITEM_HEIGHT)
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
      _.forEach(this.groups, group => {
        let item = {
          id: `GROUP:${group.title}`,
          group: group,
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
        let el = this.$refs.mainRef
        if (!_.isNil(el)) {
          // fix scroll unexpected position by setTimeout
          setTimeout(() => {
            el.scrollTo(0, scrollTop)
          }, 0)
        }
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

.action-menu-list {
  .header-menu-popover;
}
</style>

<style lang="less" scoped>
@import '~@/styles/common';

.title {
  color: @antTextBlack;
  font-weight: bold;
  font-size: 16 * @pr;
  cursor: default;
}

.right {
  display: flex;
}

.user {
  width: 32 * @pr;
  height: 32 * @pr;
  cursor: pointer;
}

.action-readed,
.action-add,
.action-menu {
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextSemi;
  margin-left: 16 * @pr;
  margin-right: 16 * @pr;
  position: relative;
  right: -24 * @pr;
}

.action-menu-dot,
.action-menu-account-dot,
.action-menu-help-dot {
  position: absolute;
  display: inline-block;
  width: 8 * @pr;
  height: 8 * @pr;
  border-radius: 4 * @pr;
  background: @antBlue;
  z-index: 99;
}

.action-menu-dot {
  right: 4 * @pr;
  top: 6 * @pr;
}

.action-menu-account-dot,
.action-menu-help-dot {
  right: 5 * @pr;
  top: 20 * @pr;
}

.menu-list {
  padding: 0 0;
}

.menu-list .mu-item-title {
  font-size: 15 * @pr;
}

.list .feed-group-item,
.list .feed-item {
  margin-top: 8 * @pr;
  cursor: pointer;
}

.list .active-item {
  box-shadow: 0 0 4 * @pr 0 @antInk;
}

.list-upper {
  display: flex;
  flex-direction: column-reverse;
}

.empty-placeholder-wrapper,
.list-placeholder-wrapper {
  position: absolute;
  top: 0;
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

.list-enter-active,
.list-leave-active {
  transition: all 1s ease;
}

.list-enter,
.list-leave-to {
  opacity: 0;
}
</style>
