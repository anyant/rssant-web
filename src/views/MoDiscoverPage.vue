<template>
  <MoLayout grey header solo class="discover-layout">
    <MoBackHeader border>
      <template v-slot:title>发现订阅源</template>
    </MoBackHeader>
    <div class="discover-body">
      <div v-if="isLoading" class="tabs-skeleton" aria-hidden="true">
        <span v-for="i in 4" :key="i" class="skeleton-tab"></span>
      </div>
      <div
        v-else-if="!error && categories.length"
        ref="tabsWrap"
        class="tabs-wrap"
        :class="{ 'has-overflow': hasOverflow, 'has-left': hasLeft }"
      >
        <div
          ref="tabsScroll"
          class="tabs-scroll"
          role="tablist"
          aria-label="订阅源分类"
          @scroll="onTabsScroll"
          @keydown="onTabsKeydown"
        >
          <button
            v-for="category in categories"
            :key="category.slug"
            type="button"
            class="tab"
            :class="{ active: category.slug === activeSlug }"
            role="tab"
            :aria-selected="category.slug === activeSlug ? 'true' : 'false'"
            @click="selectCategory(category.slug)"
          >{{ category.name }}</button>
        </div>
        <div class="tabs-fade-left"></div>
        <div class="tabs-fade"></div>
        <button
          v-show="hasOverflow"
          ref="tabsAll"
          type="button"
          class="tabs-all"
          aria-label="全部分类"
          @click="openSheet"
        >
          <span>全部</span>
          <fa-icon icon="caret-down" :size="10" />
        </button>
      </div>

      <div v-if="isLoading" class="list-scroll" aria-busy="true">
        <div v-for="i in 6" :key="i" class="skeleton-row">
          <div class="skeleton-lines">
            <div class="sk sk-title"></div>
            <div class="sk sk-intro"></div>
          </div>
          <div class="sk sk-btn"></div>
        </div>
      </div>
      <div v-else-if="error" class="state-full" role="alert">
        <fa-icon class="state-icon" icon="exclamation-circle" :size="32" />
        <div class="state-title">订阅源加载失败</div>
        <div class="state-error">{{ error }}</div>
        <button type="button" class="state-btn" @click="loadData">重试</button>
      </div>
      <div v-else-if="activeItems.length === 0" class="state-full">
        <div class="state-title">{{ categories.length ? '这个分类还没有可订阅的源' : '还没有可订阅的源' }}</div>
        <div class="state-desc">{{ categories.length ? '可以看看其他分类，或稍后再来。' : '稍后再来看看。' }}</div>
        <button type="button" class="state-btn" @click="onEmptyAction">
          {{ categories.length && activeSlug !== 'featured' ? '看精选' : '刷新' }}
        </button>
      </div>
      <div v-else ref="listScroll" class="list-scroll">
        <div v-for="item in activeItems" :key="item.url" class="discover-row">
          <div class="row-main">
            <div class="row-title">{{ item.title || item.url }}</div>
            <div v-if="item.editor_intro" class="row-intro">{{ item.editor_intro }}</div>
          </div>
          <div class="row-side">
            <div v-if="updateTime(item)" class="row-time">{{ updateTime(item) }}</div>
            <button
              type="button"
              class="sub-btn"
              :class="{ selected: isSelected(item.url), subscribed: isSubscribed(item.url) }"
              :aria-pressed="isSelected(item.url) ? 'true' : 'false'"
              :aria-disabled="isSubscribed(item.url) ? 'true' : 'false'"
              :disabled="isSubscribed(item.url)"
              @click="toggleSelect(item.url)"
            >
              <fa-icon v-if="isSelected(item.url) || isSubscribed(item.url)" icon="check" :size="12" />
              <span>{{ isSubscribed(item.url) ? '已订阅' : isSelected(item.url) ? '已选' : '订阅' }}</span>
            </button>
          </div>
        </div>
      </div>

      <footer v-if="!isLoading && !error && categories.length" class="bottom-bar">
        <div class="count">已选 {{ selectedCount }} 个源</div>
        <mu-button
          class="start-btn"
          :color="antGreen"
          :disabled="selectedCount === 0 || isSubscribing"
          @click="onStartReading"
        >
          <span v-if="isSubscribing" class="btn-spinner"></span>
          <span>{{ isSubscribing ? '正在订阅…' : '开始阅读' }}</span>
        </mu-button>
      </footer>
    </div>

    <mu-dialog
      class="discover-confirm-dialog"
      :open.sync="isConfirmOpen"
      :title="confirmTitle"
      :overlay-close="false"
    >
      <div class="confirm-desc">内容可能不够读，以后可以在「发现」里添加。</div>
      <mu-button slot="actions" flat @click="isConfirmOpen = false">多选几个源</mu-button>
      <mu-button
        slot="actions"
        flat
        :color="antGreen"
        :disabled="isSubscribing"
        @click="subscribeSelected"
      >开始阅读</mu-button>
    </mu-dialog>

    <transition name="fade">
      <div v-if="isSheetOpen" class="sheet-overlay" @click.self="closeSheet">
        <div
          ref="sheet"
          class="sheet"
          role="dialog"
          aria-modal="true"
          aria-label="全部分类"
          tabindex="-1"
          @keydown="onSheetKeydown"
        >
          <div class="sheet-head">
            <div class="sheet-title">全部分类</div>
            <button
              ref="sheetClose"
              type="button"
              class="sheet-close"
              aria-label="关闭"
              @click="closeSheet"
            >
              <fa-icon icon="times" :size="16" />
            </button>
          </div>
          <div class="sheet-grid">
            <button
              v-for="category in categories"
              :key="category.slug"
              type="button"
              class="sheet-chip"
              :class="{ active: category.slug === activeSlug }"
              @click="selectCategoryFromSheet(category.slug)"
            >{{ category.name }}</button>
          </div>
        </div>
      </div>
    </transition>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import { API } from '@/plugin/api'
import { antGreen } from '@/plugin/common'
import { formatUpdateTime } from '@/plugin/datefmt'
import { feedStore } from '@/store/feed'

export default {
  name: 'MoDiscoverPage',
  components: { MoLayout, MoBackHeader },
  data() {
    return {
      antGreen,
      isLoading: true,
      error: null,
      categories: [],
      items: [],
      activeSlug: '',
      selectedUrls: [],
      isConfirmOpen: false,
      confirmCount: 0,
      isSubscribing: false,
      isSheetOpen: false,
      hasOverflow: false,
      hasLeft: false,
    }
  },
  computed: {
    activeItems() {
      if (!this.activeSlug) {
        return []
      }
      return this.items.filter(item => item.category === this.activeSlug)
    },
    selectedCount() {
      return this.selectedUrls.length
    },
    confirmTitle() {
      return `只选了 ${this.confirmCount} 个源`
    },
    subscribedUrls() {
      return _.compact(feedStore.feedIds.map(feedId => {
        let feed = feedStore.get(feedId)
        return feed ? feed.url : null
      }))
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateTabsOverflow)
    this.loadData()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateTabsOverflow)
  },
  methods: {
    async loadData() {
      this.isLoading = true
      this.error = null
      try {
        try {
          await feedStore.sync()
        } catch (error) {
          // 订阅列表加载失败不阻塞发现页；已订阅状态最多显示为未订阅
        }
        let data = await API.discover.get()
        this.categories = data.categories || []
        this.items = data.items || []
        this.activeSlug = this.categories.length > 0 ? this.categories[0].slug : ''
        this.selectedUrls = []
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
        this.$nextTick(() => {
          this.updateTabsOverflow()
          this.scrollActiveTab()
        })
      }
    },
    updateTime(item) {
      return formatUpdateTime(item.dt_latest_story_published)
    },
    isSelected(url) {
      return this.selectedUrls.indexOf(url) >= 0
    },
    isSubscribed(url) {
      return this.subscribedUrls.indexOf(url) >= 0
    },
    toggleSelect(url) {
      if (this.isSubscribed(url)) {
        return
      }
      let index = this.selectedUrls.indexOf(url)
      if (index >= 0) {
        this.selectedUrls.splice(index, 1)
      } else {
        this.selectedUrls.push(url)
      }
    },
    selectCategory(slug) {
      if (this.activeSlug === slug) {
        return
      }
      this.activeSlug = slug
      this.$nextTick(() => {
        if (this.$refs.listScroll) {
          this.$refs.listScroll.scrollTop = 0
        }
        this.scrollActiveTab()
      })
    },
    scrollActiveTab() {
      let scroll = this.$refs.tabsScroll
      if (!scroll) {
        return
      }
      let active = scroll.querySelector('.tab.active')
      if (!active || scroll.scrollWidth <= scroll.clientWidth + 1) {
        return
      }
      let left = active.offsetLeft - (scroll.clientWidth - active.offsetWidth) / 2
      let reduceMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      scroll.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' })
    },
    onTabsScroll() {
      let scroll = this.$refs.tabsScroll
      this.hasLeft = !!scroll && scroll.scrollLeft > 1
    },
    updateTabsOverflow() {
      let wrap = this.$refs.tabsWrap
      let scroll = this.$refs.tabsScroll
      if (!wrap || !scroll) {
        return
      }
      wrap.classList.remove('has-overflow')
      let overflow = scroll.scrollWidth > scroll.clientWidth + 1
      wrap.classList.toggle('has-overflow', overflow)
      this.hasOverflow = overflow
      this.onTabsScroll()
    },
    onTabsKeydown(event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return
      }
      if (this.categories.length === 0) {
        return
      }
      event.preventDefault()
      let index = this.categories.findIndex(category => category.slug === this.activeSlug)
      let offset = event.key === 'ArrowRight' ? 1 : -1
      let next = (index + offset + this.categories.length) % this.categories.length
      this.selectCategory(this.categories[next].slug)
      this.$nextTick(() => {
        let tabs = this.$refs.tabsScroll.querySelectorAll('.tab')
        if (tabs[next]) {
          tabs[next].focus()
        }
      })
    },
    onEmptyAction() {
      if (this.categories.length > 0 && this.activeSlug !== 'featured') {
        this.selectCategory('featured')
      } else {
        this.loadData()
      }
    },
    onStartReading() {
      if (this.selectedCount === 0 || this.isSubscribing) {
        return
      }
      if (this.selectedCount < 3) {
        this.confirmCount = this.selectedCount
        this.isConfirmOpen = true
        return
      }
      this.subscribeSelected()
    },
    async subscribeSelected() {
      if (this.isSubscribing || this.selectedUrls.length === 0) {
        return
      }
      this.isSubscribing = true
      try {
        let result = await feedStore.import({
          text: this.selectedUrls.join('\n'),
          group: null,
        })
        let message
        if (result.numCreatedFeeds > 0) {
          message = `已订阅 ${result.numCreatedFeeds} 个源`
        } else if (result.numFeedCreations > 0) {
          message = `${result.numFeedCreations} 个链接正在查找中，稍后即可阅读`
        } else {
          message = '这些源都已订阅'
        }
        if (result.numExistedFeeds > 0 && result.numCreatedFeeds > 0) {
          message += `，${result.numExistedFeeds} 个已存在`
        }
        this.$toast.success({ message: message, time: 10000 })
        this.isConfirmOpen = false
        this.$router.replace('/')
      } catch (error) {
        this.$toast.error({ message: '订阅失败：' + error.message, time: 10000 })
      } finally {
        this.isSubscribing = false
      }
    },
    openSheet() {
      this.isSheetOpen = true
      this.$nextTick(() => {
        if (this.$refs.sheetClose) {
          this.$refs.sheetClose.focus()
        }
      })
    },
    closeSheet() {
      this.isSheetOpen = false
      this.$nextTick(() => {
        if (this.$refs.tabsAll) {
          this.$refs.tabsAll.focus()
        }
      })
    },
    selectCategoryFromSheet(slug) {
      this.closeSheet()
      this.selectCategory(slug)
    },
    onSheetKeydown(event) {
      if (event.key === 'Escape') {
        this.closeSheet()
        return
      }
      if (event.key !== 'Tab' || !this.$refs.sheet) {
        return
      }
      let focusables = this.$refs.sheet.querySelectorAll('button')
      if (focusables.length === 0) {
        return
      }
      let first = focusables[0]
      let last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.layout .discover-body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs-wrap {
  position: relative;
  flex: none;
  height: 48 * @pr;
  display: flex;
  background: @antBackWhite;
  border-bottom: 1px solid @antLineGrey;
}

.tabs-scroll {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 24 * @pr;
  padding: 0 16 * @pr;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  position: relative;
  flex: none;
  height: 48 * @pr;
  padding: 0;
  border: 0;
  background: none;
  color: @antTextGrey;
  font-size: 14 * @pr;
  line-height: 48 * @pr;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: @antTextSemi;
  }

  &.active {
    color: #2e7d32;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 2 * @pr;
      border-radius: 1 * @pr;
      background: @antGreen;
    }
  }

  &:focus-visible {
    outline: 2 * @pr solid rgba(102, 187, 106, 0.5);
    outline-offset: -4 * @pr;
  }
}

.tabs-fade,
.tabs-fade-left {
  display: none;
  position: absolute;
  top: 0;
  bottom: 1px;
  width: 24 * @pr;
  pointer-events: none;
  z-index: 1;
}

.tabs-fade {
  right: 60 * @pr;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), @antBackWhite);
}

.tabs-fade-left {
  left: 0;
  width: 16 * @pr;
  background: linear-gradient(to right, @antBackWhite, rgba(255, 255, 255, 0));
}

.tabs-all {
  display: none;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 2 * @pr;
  width: 60 * @pr;
  height: 48 * @pr;
  padding: 0;
  border: 0;
  border-left: 1px solid @antLineGrey;
  background: @antBackWhite;
  color: @antTextGrey;
  font-size: 13 * @pr;
  line-height: 48 * @pr;
  cursor: pointer;
  position: relative;
  z-index: 2;

  &:hover {
    color: @antTextSemi;
  }

  &:focus-visible {
    outline: 2 * @pr solid rgba(102, 187, 106, 0.5);
    outline-offset: -4 * @pr;
  }
}

.tabs-wrap.has-overflow .tabs-all {
  display: inline-flex;
}

.tabs-wrap.has-overflow .tabs-fade {
  display: block;
}

.tabs-wrap.has-left .tabs-fade-left {
  display: block;
}

.list-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16 * @pr;
}

.discover-row {
  display: flex;
  align-items: center;
  gap: 12 * @pr;
  height: 72 * @pr;
  padding: 0 16 * @pr;
  background: @antBackWhite;
  transition: background-color 0.15s ease;

  & + .discover-row {
    margin-top: 8 * @pr;
  }

  &:hover {
    background: #fcfcfc;
  }
}

.row-main {
  flex: 1;
  min-width: 0;
}

.row-title {
  font-size: 15 * @pr;
  line-height: 22 * @pr;
  font-weight: 500;
  color: @antTextSemi;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-intro {
  margin-top: 2 * @pr;
  font-size: 13 * @pr;
  line-height: 20 * @pr;
  color: #666666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-side {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4 * @pr;
}

.row-time {
  font-size: 12 * @pr;
  line-height: 16 * @pr;
  color: @antTextGrey;
  font-variant-numeric: tabular-nums;
}

.sub-btn {
  position: relative;
  min-width: 72 * @pr;
  height: 32 * @pr;
  padding: 0 10 * @pr;
  border: 1px solid @antGreen;
  border-radius: 2 * @pr;
  background: @antBackWhite;
  color: #2e7d32;
  font-size: 13 * @pr;
  line-height: 30 * @pr;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4 * @pr;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;

  &::after {
    content: '';
    position: absolute;
    inset: -6 * @pr -2 * @pr;
  }

  &:hover {
    background: rgba(102, 187, 106, 0.08);
  }

  &:active {
    background: rgba(102, 187, 106, 0.14);
  }

  &:focus-visible {
    outline: 2 * @pr solid rgba(102, 187, 106, 0.5);
    outline-offset: 2 * @pr;
  }

  &.selected {
    background: @antGreen;
    border-color: @antGreen;
    color: @antTextWhite;

    &:hover {
      background: #5cb160;
    }
  }

  &.subscribed {
    background: transparent;
    border-color: transparent;
    color: @antTextLight;
    cursor: default;

    &:hover,
    &:active {
      background: transparent;
    }
  }
}

.bottom-bar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16 * @pr;
  padding: 12 * @pr 16 * @pr calc(12 * @pr + env(safe-area-inset-bottom));
  background: @antBackWhite;
  border-top: 1px solid @antLineGrey;
}

.count {
  font-size: 13 * @pr;
  line-height: 20 * @pr;
  color: #666666;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.start-btn {
  min-width: 152 * @pr;
  height: 40 * @pr;
  padding: 0 16 * @pr;
  font-size: 16 * @pr;
  font-weight: 600;
  box-shadow: none;
}

.start-btn[disabled] {
  background: #a5d6a7 !important;
  color: @antTextWhite !important;
  opacity: 0.85;
  cursor: not-allowed;
}

.btn-spinner {
  display: inline-block;
  width: 14 * @pr;
  height: 14 * @pr;
  margin-right: 8 * @pr;
  border: 2 * @pr solid rgba(255, 255, 255, 0.55);
  border-top-color: @antTextWhite;
  border-radius: 50%;
  animation: discover-spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes discover-spin {
  to {
    transform: rotate(360deg);
  }
}

.state-full {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32 * @pr;
  text-align: center;
}

.state-icon {
  color: @antTextLight;
  margin-bottom: 12 * @pr;
}

.state-title {
  font-size: 16 * @pr;
  line-height: 24 * @pr;
  font-weight: 600;
  color: @antTextSemi;
}

.state-desc {
  margin-top: 8 * @pr;
  font-size: 13 * @pr;
  line-height: 20 * @pr;
  color: #666666;
}

.state-error {
  margin-top: 8 * @pr;
  max-width: 320 * @pr;
  font-size: 12 * @pr;
  line-height: 18 * @pr;
  color: @antTextGrey;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.state-btn {
  margin-top: 24 * @pr;
  height: 40 * @pr;
  padding: 0 20 * @pr;
  border: 1px solid @antGreen;
  border-radius: 2 * @pr;
  background: @antBackWhite;
  color: #2e7d32;
  font-size: 14 * @pr;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: rgba(102, 187, 106, 0.08);
  }

  &:focus-visible {
    outline: 2 * @pr solid rgba(102, 187, 106, 0.5);
    outline-offset: 2 * @pr;
  }
}

.tabs-skeleton {
  flex: none;
  height: 48 * @pr;
  display: flex;
  align-items: center;
  gap: 24 * @pr;
  padding: 0 16 * @pr;
  background: @antBackWhite;
  border-bottom: 1px solid @antLineGrey;
}

.skeleton-tab {
  display: inline-block;
  width: 48 * @pr;
  height: 14 * @pr;
  border-radius: 2 * @pr;
  background: #eeeeee;
  animation: discover-pulse 1.4s ease-in-out infinite;

  &:nth-child(2) {
    width: 64 * @pr;
  }

  &:nth-child(3) {
    width: 56 * @pr;
  }

  &:nth-child(4) {
    width: 48 * @pr;
  }
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 12 * @pr;
  height: 72 * @pr;
  padding: 0 16 * @pr;
  background: @antBackWhite;

  & + .skeleton-row {
    margin-top: 8 * @pr;
  }
}

.skeleton-lines {
  flex: 1;
}

.sk {
  border-radius: 2 * @pr;
  background: #eeeeee;
  animation: discover-pulse 1.4s ease-in-out infinite;
}

.sk-title {
  width: 38%;
  height: 14 * @pr;
}

.sk-intro {
  width: 64%;
  height: 12 * @pr;
  margin-top: 8 * @pr;
}

.sk-btn {
  flex: none;
  width: 72 * @pr;
  height: 32 * @pr;
}

@keyframes discover-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

.discover-confirm-dialog /deep/ .mu-dialog {
  width: 400 * @pr;
  max-width: calc(100vw - 32 * @pr);
}

.discover-confirm-dialog /deep/ .mu-dialog-title {
  font-size: 18 * @pr;
  line-height: 26 * @pr;
  font-weight: 600;
  color: @antTextSemi;
}

.confirm-desc {
  margin-top: 8 * @pr;
  font-size: 14 * @pr;
  line-height: 22 * @pr;
  color: #666666;
}

.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.4);
}

.sheet {
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  padding: 16 * @pr 16 * @pr calc(16 * @pr + env(safe-area-inset-bottom));
  border-radius: 8 * @pr 8 * @pr 0 0;
  background: @antBackWhite;
  animation: discover-slide-up 0.2s ease;
  outline: none;
}

.sheet-head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32 * @pr;
}

.sheet-title {
  font-size: 16 * @pr;
  line-height: 24 * @pr;
  font-weight: 600;
  color: @antTextSemi;
}

.sheet-close {
  width: 32 * @pr;
  height: 32 * @pr;
  padding: 0;
  border: 0;
  background: none;
  color: @antTextGrey;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:focus-visible {
    outline: 2 * @pr solid rgba(102, 187, 106, 0.5);
    outline-offset: 2 * @pr;
  }
}

.sheet-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8 * @pr;
  padding-top: 8 * @pr;
  overflow-y: auto;
}

.sheet-chip {
  height: 44 * @pr;
  padding: 0 12 * @pr;
  border: 1px solid @antLineGrey;
  border-radius: 2 * @pr;
  background: @antBackWhite;
  color: @antTextSemi;
  font-size: 14 * @pr;
  text-align: center;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    border-color: @antGreen;
  }

  &.active {
    border-color: @antGreen;
    background: #f1f8f1;
    color: #2e7d32;
    font-weight: 600;
  }

  &:focus-visible {
    outline: 2 * @pr solid rgba(102, 187, 106, 0.5);
    outline-offset: 2 * @pr;
  }
}

@keyframes discover-slide-up {
  from {
    transform: translateY(16 * @pr);
    opacity: 0.6;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600 * @pr) {
  .tabs-scroll {
    gap: 20 * @pr;
  }

  .start-btn {
    height: 44 * @pr;
  }
}

@media (min-width: 600 * @pr) {
  .sheet-overlay {
    align-items: center;
    padding: 16 * @pr;
  }

  .sheet {
    width: 400 * @pr;
    max-height: 60vh;
    border-radius: 4 * @pr;
  }

  .sheet-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }

  .tabs-scroll {
    scroll-behavior: auto;
  }
}
</style>
