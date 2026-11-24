<template>
  <MoLayout grey header solo class="discover-layout">
    <MoBackHeader border>
      <template v-slot:title>发现订阅源</template>
    </MoBackHeader>
    <div class="discover-body">
      <div class="search-bar">
        <div class="search-field" :class="{ focus: isSearchFocused }">
          <fa-icon class="search-icon" icon="search" :size="14" />
          <input
            ref="searchInputEl"
            :value="searchInput"
            type="text"
            class="search-input"
            placeholder="搜索订阅源、分类"
            aria-label="搜索订阅源"
            autocomplete="off"
            @input="onSearchInput"
            @compositionstart="onSearchCompositionStart"
            @compositionend="onSearchCompositionEnd"
            @focus="isSearchFocused = true"
            @blur="onSearchBlur"
            @keydown.esc="clearSearch"
          />
          <button
            v-if="searchInput"
            type="button"
            class="search-clear"
            aria-label="清空搜索"
            @mousedown.prevent
            @click="clearSearch"
          >
            <fa-icon icon="times" :size="12" />
          </button>
        </div>
      </div>
      <div v-if="isLoading" class="tabs-skeleton" aria-hidden="true">
        <span v-for="i in 4" :key="i" class="skeleton-tab"></span>
      </div>
      <div
        v-else-if="!error && categories.length && !isSearching"
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

      <div v-if="isSearching && !isLoading && !error && displayItems.length > 0" class="search-summary">
        <span class="search-summary-query">搜索「{{ searchQuery.trim() }}」</span>
        <span class="search-summary-count">找到 {{ displayItems.length }} 个源</span>
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
      <div v-else-if="displayItems.length === 0" class="state-full">
        <template v-if="isSearching && items.length > 0">
          <div class="state-title">没有找到相关订阅源</div>
          <div class="state-desc">换个关键词试试。</div>
          <button type="button" class="state-btn" @click="clearSearch">清空搜索</button>
        </template>
        <template v-else>
          <div class="state-title">{{ categories.length ? '这个分类还没有可订阅的源' : '还没有可订阅的源' }}</div>
          <div class="state-desc">{{ categories.length ? '可以看看其他分类，或稍后再来。' : '稍后再来看看。' }}</div>
          <button type="button" class="state-btn" @click="onEmptyAction">
            {{ categories.length && activeSlug !== 'featured' ? '看精选' : '刷新' }}
          </button>
        </template>
      </div>
      <div
        v-else
        ref="listScroll"
        class="list-scroll"
        :class="{ 'is-browse': !isGuideMode }"
        @scroll.passive="onListScroll"
        @keydown="onListKeydown"
      >
        <div v-for="item in displayRows" :key="item.category + ':' + item.url" class="discover-row">
          <div class="row-main">
            <div class="row-title">{{ item.title || item.url }}</div>
            <div v-if="item.editor_intro" class="row-intro">{{ item.editor_intro }}</div>
          </div>
          <div class="row-side">
            <div v-if="updateTime(item)" class="row-time">{{ updateTime(item) }}</div>
            <button
              type="button"
              class="sub-btn"
              :class="{
                selected: item._selected,
                subscribed: item._subscribed,
                loading: item._subscribing,
              }"
              :aria-pressed="isGuideMode ? (item._selected ? 'true' : 'false') : null"
              :aria-disabled="item._subscribed || item._subscribing ? 'true' : 'false'"
              :disabled="item._subscribed || item._subscribing"
              @click="onRowAction(item.url)"
            >
              <span v-if="item._subscribing" class="row-spinner"></span>
              <fa-icon
                v-else-if="item._selected || item._subscribed"
                icon="check"
                :size="12"
              />
              <span>{{ item._label }}</span>
            </button>
          </div>
        </div>
      </div>

      <footer v-if="!isLoading && !error && categories.length && isGuideMode" class="bottom-bar">
        <div class="count">已选 {{ selectedCount }} 个源</div>
        <mu-button
          ref="startBtn"
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
      @click.native="onConfirmOverlayClick"
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

const RENDER_BATCH_SIZE = 80

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
      subscribingUrls: [],
      submittedUrls: [],
      isConfirmOpen: false,
      confirmCount: 0,
      isSubscribing: false,
      isSheetOpen: false,
      hasOverflow: false,
      hasLeft: false,
      searchInput: '',
      searchQuery: '',
      isSearchFocused: false,
      isComposing: false,
      // 首屏只渲染一批，滚动或键盘走到末尾时再追加，避免几千行一次挂载。
      renderLimit: RENDER_BATCH_SIZE,
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
    normalizedSearchQuery() {
      return this.searchQuery.trim().toLowerCase()
    },
    isSearching() {
      return this.normalizedSearchQuery !== ''
    },
    categoryNameBySlug() {
      let result = {}
      for (let category of this.categories) {
        result[category.slug] = category.name
      }
      return result
    },
    searchRows() {
      // 同一个 url 可能挂在多个分类下，且有各自的简介；每一行单独保留检索文本，
      // 才能和现在「同一行命中全部词」的语义一致，也不会把不同行的词拼在一起。
      let result = []
      for (let item of this.items) {
        let categoryName = this.categoryNameBySlug[item.category] || ''
        let text = [item.title, item.editor_intro, categoryName].join(' ').toLowerCase()
        result.push({ item, text })
      }
      return result
    },
    displayItems() {
      if (!this.isSearching) {
        return this.activeItems
      }
      let terms = this.normalizedSearchQuery.split(/\s+/)
      // 同一个 url 可同时在多个分类下、且简介可能不同；逐行匹配后在首次命中处保留一条。
      let seen = new Set()
      let result = []
      for (let row of this.searchRows) {
        let url = row.item.url
        if (seen.has(url)) {
          continue
        }
        if (terms.every(term => row.text.includes(term))) {
          seen.add(url)
          result.push(row.item)
        }
      }
      return result
    },
    isGuideMode() {
      return this.$route.query.mode === 'guide'
    },
    subscribedUrlSet() {
      return new Set(this.subscribedUrls)
    },
    submittedUrlSet() {
      return new Set(this.submittedUrls)
    },
    selectedUrlSet() {
      return new Set(this.selectedUrls)
    },
    subscribingUrlSet() {
      return new Set(this.subscribingUrls)
    },
    // 模板逐行调用依赖订阅列表的 computed 时，Vue 2 会把每个订阅登记到当前渲染 watcher；
    // 这里每次渲染只取一次集合，行上只放展示需要的字段。
    displayRows() {
      let subscribed = this.subscribedUrlSet
      let submitted = this.submittedUrlSet
      let selected = this.selectedUrlSet
      let subscribing = this.subscribingUrlSet
      let isGuideMode = this.isGuideMode
      return this.displayItems.slice(0, this.renderLimit).map(item => {
        let isSubscribed = subscribed.has(item.url) || submitted.has(item.url)
        let isSubscribing = subscribing.has(item.url)
        let isSelected = selected.has(item.url)
        let label = '订阅'
        if (isSubscribed) {
          label = '已订阅'
        } else if (isSubscribing) {
          label = '订阅中…'
        } else if (isGuideMode && isSelected) {
          label = '已选'
        }
        return {
          ...item,
          _subscribed: isSubscribed,
          _subscribing: isSubscribing,
          _selected: isGuideMode && isSelected,
          _label: label,
        }
      })
    },
    totalFeedCount() {
      return feedStore.numFeeds + this.selectedCount
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
  watch: {
    isConfirmOpen(value) {
      if (value) {
        document.addEventListener('keydown', this.onConfirmKeydown)
        this.focusConfirmDialog()
      } else {
        document.removeEventListener('keydown', this.onConfirmKeydown)
        clearTimeout(this._confirmFocusTimer)
        this.$nextTick(() => {
          if (this.$refs.startBtn) {
            this.$refs.startBtn.$el.focus()
          }
        })
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateTabsOverflow)
    this.loadData()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateTabsOverflow)
    document.removeEventListener('keydown', this.onConfirmKeydown)
    clearTimeout(this._confirmFocusTimer)
    if (this._appendFrame) {
      cancelAnimationFrame(this._appendFrame)
      this._appendFrame = null
    }
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
        this.subscribingUrls = []
        this.submittedUrls = []
        this.resetRenderLimit()
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
    onListScroll() {
      if (this._appendFrame) {
        return
      }
      let el = this.$refs.listScroll
      this._appendFrame = requestAnimationFrame(() => {
        this._appendFrame = null
        if (this._isDestroyed || !el || this.renderLimit >= this.displayItems.length) {
          return
        }
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
          this.renderLimit += RENDER_BATCH_SIZE
        }
      })
    },
    onListKeydown(event) {
      if (event.key !== 'Tab' || event.shiftKey) {
        return
      }
      if (this.renderLimit >= this.displayItems.length) {
        return
      }
      let el = this.$refs.listScroll
      if (!el) {
        return
      }
      let rows = el.querySelectorAll('.discover-row')
      if (rows.length === 0 || !rows[rows.length - 1].contains(event.target)) {
        return
      }
      event.preventDefault()
      let nextIndex = rows.length
      this.renderLimit += RENDER_BATCH_SIZE
      this.$nextTick(() => {
        let nextRows = this.$refs.listScroll ? this.$refs.listScroll.querySelectorAll('.discover-row') : []
        let nextRow = nextRows[nextIndex]
        let nextButton = nextRow ? nextRow.querySelector('.sub-btn') : null
        if (nextButton) {
          nextButton.focus()
        }
      })
    },
    resetRenderLimit() {
      if (this._appendFrame) {
        cancelAnimationFrame(this._appendFrame)
        this._appendFrame = null
      }
      this.renderLimit = RENDER_BATCH_SIZE
    },
    onSearchInput(event) {
      this.searchInput = event.target.value
      if (this.isComposing || event.isComposing) {
        return
      }
      this.applySearch()
    },
    onSearchCompositionStart() {
      this.isComposing = true
    },
    onSearchCompositionEnd() {
      this.isComposing = false
      this.applySearch()
    },
    onSearchBlur() {
      this.isSearchFocused = false
      this.isComposing = false
    },
    applySearch() {
      let wasSearching = this.isSearching
      this.searchQuery = this.searchInput
      this.resetRenderLimit()
      this.$nextTick(() => {
        if (this.$refs.listScroll) {
          this.$refs.listScroll.scrollTop = 0
        }
        if (wasSearching && !this.isSearching) {
          this.updateTabsOverflow()
          this.scrollActiveTab()
        }
      })
    },
    clearSearch() {
      this.searchInput = ''
      this.isComposing = false
      this.applySearch()
      this.$nextTick(() => {
        if (this.$refs.searchInputEl) {
          this.$refs.searchInputEl.focus()
        }
      })
    },
    updateTime(item) {
      return formatUpdateTime(item.dt_latest_story_published)
    },
    isSubscribed(url) {
      return this.subscribedUrlSet.has(url) || this.submittedUrlSet.has(url)
    },
    isSubscribingUrl(url) {
      return this.subscribingUrlSet.has(url)
    },
    onRowAction(url) {
      if (this.isSubscribed(url) || this.isSubscribingUrl(url)) {
        return
      }
      if (this.isGuideMode) {
        this.toggleSelect(url)
      } else {
        this.subscribeOne(url)
      }
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
      this.resetRenderLimit()
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
      if (this.totalFeedCount < 3) {
        this.confirmCount = this.selectedCount
        this.isConfirmOpen = true
        return
      }
      this.subscribeSelected()
    },
    subscribeResultMessage(result, isSingle) {
      let message
      if (result.numCreatedFeeds > 0) {
        message = `已订阅 ${result.numCreatedFeeds} 个源`
      } else if (result.numFeedCreations > 0) {
        message = `${result.numFeedCreations} 个链接正在查找中，稍后即可阅读`
      } else {
        message = isSingle ? '这个源已订阅' : '这些源都已订阅'
      }
      if (result.numExistedFeeds > 0 && result.numCreatedFeeds > 0) {
        message += `，${result.numExistedFeeds} 个已存在`
      }
      return message
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
        this.$toast.success({ message: this.subscribeResultMessage(result, false), time: 10000 })
        this.isConfirmOpen = false
        this.$router.replace('/')
      } catch (error) {
        this.$toast.error({ message: '订阅失败：' + error.message, time: 10000 })
      } finally {
        this.isSubscribing = false
      }
    },
    async subscribeOne(url) {
      if (this.isSubscribingUrl(url) || this.isSubscribed(url)) {
        return
      }
      this.subscribingUrls.push(url)
      try {
        let result = await feedStore.import({ text: url, group: null })
        this.submittedUrls.push(url)
        this.$toast.success({ message: this.subscribeResultMessage(result, true), time: 10000 })
      } catch (error) {
        this.$toast.error({ message: '订阅失败：' + error.message, time: 10000 })
      } finally {
        let index = this.subscribingUrls.indexOf(url)
        if (index >= 0) {
          this.subscribingUrls.splice(index, 1)
        }
      }
    },
    focusConfirmDialog() {
      clearTimeout(this._confirmFocusTimer)
      this._confirmFocusTimer = setTimeout(() => {
        let dialog = document.querySelector('.discover-confirm-dialog .mu-dialog')
        if (!dialog || dialog.offsetParent === null) {
          this.focusConfirmDialog()
          return
        }
        dialog.setAttribute('tabindex', '-1')
        dialog.style.outline = 'none'
        dialog.focus()
      }, 350)
    },
    onConfirmOverlayClick(event) {
      if (event.target === event.currentTarget) {
        this.isConfirmOpen = false
      }
    },
    onConfirmKeydown(event) {
      if (!this.isConfirmOpen) {
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        this.isConfirmOpen = false
        return
      }
      if (event.key !== 'Tab') {
        return
      }
      let dialog = document.querySelector('.discover-confirm-dialog .mu-dialog')
      if (!dialog) {
        return
      }
      let focusables = Array.from(
        dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.disabled && el.offsetParent !== null)
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      let first = focusables[0]
      let last = focusables[focusables.length - 1]
      let active = document.activeElement
      if (!focusables.includes(active)) {
        event.preventDefault()
        if (event.shiftKey) {
          last.focus()
        } else {
          first.focus()
        }
        return
      }
      if (event.shiftKey) {
        if (active === first || active === dialog) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        event.preventDefault()
        first.focus()
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

.search-bar {
  flex: none;
  padding: 8 * @pr 16 * @pr;
  background: @antBackWhite;
  border-bottom: 1px solid @antLineGrey;
}

.search-field {
  height: 40 * @pr;
  display: flex;
  align-items: center;
  gap: 8 * @pr;
  padding: 0 8 * @pr 0 10 * @pr;
  border: 1px solid transparent;
  border-radius: 2 * @pr;
  background: #f5f5f5;

  &.focus {
    border-color: @antGreen;
  }
}

.search-icon {
  flex: none;
  color: @antTextGrey;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: @antTextSemi;
  font-size: 14 * @pr;
  line-height: 20 * @pr;

  &::placeholder {
    color: @antTextLight;
  }
}

.search-clear {
  flex: none;
  width: 24 * @pr;
  height: 24 * @pr;
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

.search-summary {
  flex: none;
  height: 40 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12 * @pr;
  padding: 0 16 * @pr;
  background: @antBackWhite;
  border-bottom: 1px solid @antLineGrey;
  font-size: 13 * @pr;
  line-height: 20 * @pr;
  color: #666666;
}

.search-summary-query {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-summary-count {
  flex: none;
  color: @antTextGrey;
  font-variant-numeric: tabular-nums;
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

.list-scroll.is-browse {
  padding-bottom: calc(16 * @pr + env(safe-area-inset-bottom));
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

  &.loading {
    cursor: default;
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

.row-spinner {
  display: inline-block;
  width: 12 * @pr;
  height: 12 * @pr;
  border: 2 * @pr solid rgba(102, 187, 106, 0.3);
  border-top-color: @antGreen;
  border-radius: 50%;
  animation: discover-spin 0.8s linear infinite;
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

.discover-confirm-dialog /deep/ .mu-dialog-actions .mu-button:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 2 * @pr rgba(102, 187, 106, 0.5) !important;
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
