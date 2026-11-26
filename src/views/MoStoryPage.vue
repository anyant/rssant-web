<template>
  <MoLayout header class="story">
    <div class="story-image-viewer"></div>
    <MoBackHeader border>
      <template v-slot:title>{{ headerTitle }}</template>
      <div class="action-menu-wrapper">
        <mu-button
          icon
          ref="actionMoreRef"
          class="action-more"
          aria-label="更多"
          aria-haspopup="menu"
          :aria-expanded="isMenuOpen ? 'true' : 'false'"
          data-mu-loading-size="16"
          v-loading="isFetchLoading"
          @click="onMoreClick"
        >
          <fa-icon size="18" v-if="!isFetchLoading" icon="ellipsis-h" />
        </mu-button>
        <mu-list
          class="action-menu-list"
          :class="{ 'is-keyboard': isMenuKeyboard }"
          ref="actionMenuListRef"
          v-show="isMenuOpen"
          role="menu"
          @keydown.native="onMenuKeydown"
        >
          <mu-list-item
            button
            role="menuitem"
            tabindex="0"
            data-menu-action="font"
            @click="openReadingFont"
          >
            <mu-list-item-title>阅读字号</mu-list-item-title>
          </mu-list-item>
          <mu-list-item
            button
            role="menuitem"
            tabindex="0"
            data-menu-action="fetch"
            @click="onFetchFulltextFromMenu"
          >
            <mu-list-item-title>抓取全文</mu-list-item-title>
          </mu-list-item>
        </mu-list>
      </div>
      <mu-button
        icon
        class="action-favorited"
        :aria-label="isFavorited ? '取消收藏' : '收藏'"
        @click="toggleFavorited"
      >
        <fa-icon size="18" v-if="isFavorited" icon="star" :color="starColor" />
        <fa-icon size="18" v-else icon="far/star" :color="starColor" />
      </mu-button>
    </MoBackHeader>
    <MoReadingFontDialog :open.sync="isFontDialogOpen" />
    <MoStoryContent
      ref="contentRef"
      :story="story"
      :next-feed="nextFeed"
      :next-story="nextStory"
      :show-next-feed-title="showNextFeedTitle"
      :image-viewer-container-getter="imageViewerContainerGetter"
    ></MoStoryContent>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoStoryContent from '@/components/MoStoryContent.vue'
import MoReadingFontDialog from '@/components/MoReadingFontDialog.vue'
import { storyStore } from '@/store/story'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

export default {
  components: { MoBackHeader, MoLayout, MoReadingFontDialog, MoStoryContent },
  data() {
    return {
      isFetchLoading: false,
      isMenuOpen: false,
      isMenuKeyboard: false,
      isFontDialogOpen: false,
    }
  },
  watch: {
    isFontDialogOpen(value) {
      if (!value) {
        this.focusMoreButton()
      }
    },
  },
  computed: {
    feedId() {
      return this.$route.query.feed
    },
    offset() {
      return parseInt(this.$route.query.offset)
    },
    isFavorited() {
      return !_.isNil(this.story) && this.story.is_favorited
    },
    isReaded() {
      if (_.isNil(this.feed) || _.isNil(this.story)) {
        return false
      }
      return this.story.offset < this.feed.story_offset
    },
    starColor() {
      if (this.isFavorited) {
        return antGold
      } else {
        return null
      }
    },
    feed() {
      return feedStore.get(this.feedId)
    },
    story() {
      return storyStore.get({ feedId: this.feedId, offset: this.offset })
    },
    nextStoryInfo() {
      return storyStore.nextStoryInfo({
        feedId: this.feedId,
        offset: this.offset,
      })
    },
    showNextFeedTitle() {
      return this.nextStoryInfo.showFeedTitle
    },
    nextStory() {
      return this.nextStoryInfo.story
    },
    nextFeed() {
      if (_.isNil(this.nextStory)) {
        return null
      }
      return feedStore.get(this.nextStory.feed.id)
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
  },
  async mounted() {
    await this.loadFeedAndStory()
    await rootStore.syncFeedLoadMushrooms()
    // chrome: $route will change and mounted will not re-executed
    // firefox and safari: mounted will re-executed
    this.$watch('$route', () => {
      this.loadFeedAndStory()
    })
  },
  beforeDestroy() {
    this.removeMenuListeners()
  },
  methods: {
    imageViewerContainerGetter() {
      return this.$el.querySelector('.story-image-viewer')
    },
    onMoreClick(event) {
      // 抓取全文时 ⋯ 只显示进度，不展开菜单
      if (this.isFetchLoading) {
        return
      }
      // 键盘触发的 click，detail 为 0
      this.toggleMenu(event.detail === 0)
    },
    toggleMenu(fromKeyboard) {
      if (this.isMenuOpen) {
        this.closeMenu()
        return
      }
      this.isMenuOpen = true
      this.isMenuKeyboard = fromKeyboard
      window.addEventListener('click', this.onDocumentClick)
      window.addEventListener('keydown', this.onDocumentKeydown)
      if (fromKeyboard) {
        this.focusMenuItem(0)
      }
    },
    closeMenu() {
      if (!this.isMenuOpen) {
        return
      }
      this.isMenuOpen = false
      this.removeMenuListeners()
    },
    removeMenuListeners() {
      window.removeEventListener('click', this.onDocumentClick)
      window.removeEventListener('keydown', this.onDocumentKeydown)
    },
    onDocumentClick(event) {
      let button = this.$refs.actionMoreRef
      let menu = this.$refs.actionMenuListRef
      if (!_.isNil(button) && button.$el.contains(event.target)) {
        return
      }
      if (!_.isNil(menu) && menu.$el.contains(event.target)) {
        return
      }
      this.closeMenu()
    },
    onDocumentKeydown(event) {
      if (event.key !== 'Escape') {
        return
      }
      this.closeMenu()
      this.focusMoreButton()
    },
    menuItems() {
      let menu = this.$refs.actionMenuListRef
      if (_.isNil(menu)) {
        return []
      }
      return Array.from(menu.$el.querySelectorAll('[data-menu-action]'))
    },
    focusMenuItem(index) {
      this.$nextTick(() => {
        let items = this.menuItems()
        if (items.length > 0) {
          items[index].focus()
        }
      })
    },
    focusMoreButton() {
      this.$nextTick(() => {
        let button = this.$refs.actionMoreRef
        if (!_.isNil(button)) {
          button.$el.focus()
        }
      })
    },
    onMenuKeydown(event) {
      let items = this.menuItems()
      let index = items.indexOf(event.target)
      if (index === -1) {
        return
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        let delta = event.key === 'ArrowDown' ? 1 : -1
        items[(index + delta + items.length) % items.length].focus()
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        items[event.key === 'Home' ? 0 : items.length - 1].focus()
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        let action = event.target.getAttribute('data-menu-action')
        if (action === 'font') {
          this.openReadingFont()
        } else {
          this.onFetchFulltextFromMenu()
        }
      }
    },
    openReadingFont() {
      this.closeMenu()
      this.isFontDialogOpen = true
    },
    onFetchFulltextFromMenu() {
      this.closeMenu()
      this.onFetchFulltext()
    },
    toggleFavorited() {
      let is_favorited = !this.isFavorited
      storyStore.setFavorited({ feedId: this.feedId, offset: this.offset, is_favorited })
    },
    async onFetchFulltext() {
      if (this.isFetchLoading) {
        return
      }
      this.isFetchLoading = true
      let result = null
      try {
        result = await storyStore.fetchFulltext({ feedId: this.feedId, offset: this.offset })
      } catch (ex) {
        this.$toast.error({ message: `抓取全文失败: ${ex.message}`, time: 10000 })
      } finally {
        this.isFetchLoading = false
      }
      if (!_.isNil(result)) {
        if (result.response_status === 200) {
          if (result.accept === 'REJECT') {
            this.$toast.info(`抓取全文: 内容没有变化`)
          }
        } else {
          let message = `抓取全文失败: ${result.response_status} ${result.response_status_name}`
          this.$toast.warning({ message: message, time: 10000 })
        }
      }
    },
    async loadFeed({ feed, feedId }) {
      if (_.isNil(feed)) {
        await feedStore.load({ feedId: feedId })
      }
    },
    async loadStory({ story, feedId, offset, setReaded }) {
      if (_.isNil(story) || _.isEmpty(story.content)) {
        await storyStore.load({ feedId, offset, setReaded, detail: true })
      }
    },
    async loadFeedAndStory() {
      let feedLoaded = this.loadFeed({
        feed: this.feed,
        feedId: this.feedId,
      })
      let storyLoaded = this.loadStory({
        story: this.story,
        feedId: this.feedId,
        offset: this.offset,
        setReaded: !this.isReaded,
      })
      await feedLoaded
      await storyLoaded
      // 当 story 已加载但仍未读时，loadStory 不会更新已读状态，需要单独更新
      if (!_.isNil(this.feed) && !_.isNil(this.story) && !this.isReaded) {
        feedStore.setStoryOffset({ feedId: this.feedId, offset: this.offset + 1 })
      }
      this.scrollToTop()
      if (this.nextStoryInfo.shouldLoadNext) {
        let hasNext = this.offset + 1 < this.feed.total_storys
        if (hasNext) {
          let next = storyStore.get({
            feedId: this.feedId,
            offset: this.offset + 1,
          })
          await this.loadStory({
            story: next,
            feedId: this.feedId,
            offset: this.offset + 1,
          })
        }
      }
    },
    scrollToTop() {
      window.scrollTo(0, 0)
      let contentRef = this.$refs.contentRef
      if (!_.isNil(contentRef) && !_.isNil(contentRef.$el)) {
        contentRef.$el.scrollTo(0, 0)
      }
    },
  },
}
</script>

<style lang="less">
@import '~@/styles/common';

// 限定在阅读页，避免影响首页同名的下拉菜单
.story .action-menu-list {
  .header-menu-popover;

  // 菜单挂在 ⋯ 按钮下方 8px（按钮高 32 + 距头顶部 16 的视觉留白 → 17），右边缘和按钮对齐
  top: calc(100% + 17 * @pr) !important;
  right: -4 * @pr;
  min-width: 112 * @pr;
  overflow: hidden;

  li:focus {
    outline: none;
  }

  li .mu-item:hover,
  &.is-keyboard li:focus .mu-item,
  li:focus-visible .mu-item {
    background: @antLineGrey;
  }

  animation: action-menu-in 120ms ease-out;
}

@keyframes action-menu-in {
  from {
    opacity: 0;
    transform: translateY(-4 * @pr);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style lang="less" scoped>
@import '~@/styles/common';

.story {
  background: #ffffff;
}

.action-menu-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 16 * @pr;
}

.action-more,
.action-favorited {
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

</style>
