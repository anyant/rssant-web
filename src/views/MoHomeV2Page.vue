<template>
  <MoLayout grey header>
    <MoHeader>
      <MoDebugTool class="title">蚁阅</MoDebugTool>
      <div class="right">
        <mu-button icon class="action-readed" @click="setAllReaded">
          <mu-icon value="done"></mu-icon>
        </mu-button>
        <mu-button
          ref="wizardTrigger"
          icon
          class="action-add"
          @click="()=>{this.$router.push('/feed-creation')}"
        >
          <mu-icon value="add"></mu-icon>
        </mu-button>
        <mu-popover
          class="wizard"
          :open.sync="openWizard"
          :trigger="wizardTrigger"
          placement="bottom"
        >
          <span class="wizard-triangle"></span>
          <div class="wizard-info">点这里添加订阅</div>
        </mu-popover>
        <mu-menu placement="bottom" class="action-menu" popover-class="menu-popover">
          <mu-button icon class="action-menu-button">
            <mu-icon value="menu"></mu-icon>
          </mu-button>
          <mu-list slot="content" class="menu-list">
            <mu-list-item button @click="exportOPML">
              <mu-list-item-title>导出订阅</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="goFeedClean">
              <mu-list-item-title>清理订阅</mu-list-item-title>
            </mu-list-item>
          </mu-list>
        </mu-menu>
        <mu-avatar size="32" class="user" @click="()=>{this.$router.push('/account')}">
          <img :src="avatar" />
        </mu-avatar>
      </div>
    </MoHeader>
    <div class="items" :class="{'not-ready':!isReady}">
      <div class="feed-story-list">
        <MoFeedStoryItem
          v-for="story in mushrooms"
          :key="`${story.feed.id}:${story.offset}`"
          :feedId="story.feed.id"
          :offset="story.offset"
          :feedTitle="getFeedTitle(story.feed.id)"
          :storyTitle="story.title"
          :storyDate="story.dt_published"
          :isReaded="isReaded(story)"
        ></MoFeedStoryItem>
      </div>
      <div class="feed-list">
        <MoFeedItem
          v-for="feed in feedList"
          :key="feed.id"
          :title="feed.title"
          :number="feed.num_unread_storys"
          :date="feed.dt_latest_story_published || feed.dt_created"
          :link="`/feed/${feed.id}`"
        ></MoFeedItem>
      </div>
    </div>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoHeader from '@/components/MoHeader'
import MoLayout from '@/components/MoLayout'
import MoDebugTool from '@/components/MoDebugTool'
import MoFeedItem from '@/components/MoFeedItem.vue'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'

import defaultAvatar from '@/assets/avatar.svg'
import { antRippleGrey } from '@/plugin/common'

const ITEM_HEIGHT = 48

export default {
  name: 'MoHomePage',
  components: { MoHeader, MoLayout, MoDebugTool, MoFeedStoryItem, MoFeedItem },
  props: {
    vid: {
      type: String,
      default: '/',
    },
  },
  data() {
    return {
      rippleColor: antRippleGrey,
      openWizard: false,
      wizardTrigger: null,
      isReady: false,
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
  },
  mounted() {
    this.wizardTrigger = this.$refs.wizardTrigger.$el
    this.$API.syncFeedLoadMushrooms().then(() => {
      if (this.$API.feed.isEmpty) {
        this.openWizard = true
      }
      let scrollTop = this.$pageState.get('scrollTop')
      if (_.isNil(scrollTop) || scrollTop <= 0) {
        scrollTop = this.getDefaultScrollTop()
      }
      // call scrollTo after page rendered
      this.$nextTick(() => {
        setTimeout(() => {
          this.isReady = true
          window.scrollTo(0, scrollTop)
        }, 100)
      })
    })
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
    setAllReaded() {
      let feedIds = this.feedList.map(x => x.id)
      this.$API.feed.setAllReaded({ feedIds })
    },
    getFeedTitle(feedId) {
      return this.$API.feed.get(feedId).title
    },
    isReaded(story) {
      return this.$API.story.isReaded(story)
    },
    getDefaultScrollTop() {
      let topReaded = 0
      for (var i = 0; i < this.mushrooms.length; i++) {
        if (!this.isReaded(this.mushrooms[i])) {
          break
        }
        topReaded += 1
      }
      return topReaded * ITEM_HEIGHT
    },
  },
}
</script>

<style lang="less">
@import '~@/styles/common';

.menu-popover {
  top: 48 * @pr !important;
}

.menu-popover .menu-list .mu-item {
  height: 40 * @pr;
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
  color: @antTextBlack;
}

.wizard {
  margin-top: 8px;
  box-shadow: none;
  background-color: @antBackDark;
  opacity: 0.9;
  overflow: visible;
  cursor: default;
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

.menu-list {
  padding: 0 0;
}

.menu-list .mu-item-title {
  font-size: 15 * @pr;
}

.not-ready {
  visibility: hidden;
}

.feed-story-item,
.feed-item {
  margin-top: 8 * @pr;
}

.items {
  padding-bottom: 8 * @pr;
}
</style>
