<template>
  <div class="scroll-list">
    <transition name="fade">
      <div class="jump-to-latest" v-if="needJump">
        <mu-button @click="jumpToLatest" :color="antBlue" :ripple="false">
          <fa-icon size="18" class="jump-icon" icon="angle-double-down" />
          <span>看最新</span>
        </mu-button>
      </div>
    </transition>
    <div
      v-if="showLoadPrev"
      class="load-prev"
      @click="loadPrevByButton"
    >
      <span v-if="isPrevLoading">加载中…</span>
      <span v-else-if="prevLoadError">加载失败，点击重试</span>
      <span v-else>加载更早的文章</span>
    </div>
    <mescroll
      ref="mescroll"
      class="mescroll"
      :class="{ 'has-load-prev': !reversed }"
      :down="mescrollDown"
      :up="mescrollUp"
      @init="mescrollInit"
    >
      <div class="item-list">
        <slot></slot>
      </div>
    </mescroll>
  </div>
</template>

<script>
/**
 * List[ 0,     1,     2,     ....,     total-1 ]
 * 
 * 顺序
 * initOffset=0
 * loadInit(initOffset, size)
 * loadPrev(beginOffset-size, size)
 * loadNext(endOffset+1, size)
 * 
 * 倒序
 * initOffset=total-1
 * loadInit(initOffset-size+1, size)
 * loadPrev(endOffset+1, size)
 * loadNext(beginOffset-size, size)
 */
import _ from 'lodash'
import { antBlue } from '@/plugin/common'

const MIN_PAD_HEIGHT = 52
const ITEM_LIST_PADDING = 2
const LOAD_PREV_HEIGHT = 40

export default {
  props: {
    itemSize: {
      type: Number,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    initOffset: {
      type: Number,
    },
    beginOffset: {
      type: Number,
    },
    endOffset: {
      type: Number,
    },
    total: {
      type: Number,
      required: true,
    },
    load: {
      type: Function,
      required: true,
    },
    jump: {
      type: Function,
      required: false,
    },
    reversed: {
      type: Boolean,
      default: false,
    },
    enableUnreadPad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let pageSize = window.innerHeight - 48
    let numPageItems = Math.ceil(pageSize / this.itemSize)
    return {
      pageSize: pageSize,
      numPageItems: numPageItems,
      isPrevLoading: false,
      isNextLoading: false,
      isScrolled: false,
      prevLoadError: false,
      isLoadPrevByButton: false,
      mescrollDown: {
        auto: false,
        callback: this.onMescrolDown,
      },
      mescrollUp: {
        auto: false,
        callback: this.onMescrolUp, // 上拉加载回调
        onScroll: this.onScroll, // 滚动事件回调
        page: {
          num: 0, // 当前页
          size: numPageItems, // 每页数据条数
        },
        htmlNodata: '<div class="upwarp-nodata">没有更多了</div>',
        noMoreSize: Math.ceil(numPageItems * 0.5),
      },
      mescroll: null,
      antBlue,
    }
  },
  computed: {
    offsetAll() {
      return this.items.length * this.itemSize
    },
    realInitOffset() {
      if (!_.isNil(this.initOffset)) {
        return this.initOffset
      }
      if (this.reversed) {
        return this.total - 1
      } else {
        return 0
      }
    },
    hasOld() {
      if (this.total <= 0) {
        return false
      }
      if (this.items.length <= 0 || _.isNil(this.beginOffset)) {
        return this.realInitOffset > 0
      }
      return this.beginOffset > 0
    },
    hasNew() {
      if (this.total <= 0) {
        return false
      }
      if (this.items.length <= 0 || _.isNil(this.endOffset)) {
        return this.realInitOffset < this.total
      }
      return this.endOffset < this.total - 1
    },
    hasPrev() {
      if (this.reversed) {
        return this.hasNew
      } else {
        return this.hasOld
      }
    },
    hasNext() {
      if (this.reversed) {
        return this.hasOld
      } else {
        return this.hasNew
      }
    },
    _deltaPages() {
      let endOffset = _.defaultTo(this.endOffset, this.realInitOffset)
      let beginOffset = _.defaultTo(this.beginOffset, this.realInitOffset)
      // consider preloaded pages even when it not loaded yet
      endOffset = Math.max(endOffset, beginOffset + this.numPageItems * 2)
      let delta = (this.total - endOffset) / this.numPageItems
      return Math.floor(Math.max(0, delta))
    },
    contentFits() {
      // 内容不足一屏时无法滚动，直接露出「加载更早」，否则更早的文章加载不出来
      return this.items.length * this.itemSize <= this.pageSize - LOAD_PREV_HEIGHT
    },
    showLoadPrev() {
      if (this.reversed || !this.hasPrev || this.items.length <= 0) {
        return false
      }
      return this.isScrolled || this.contentFits
    },
    needJump() {
      if (_.isNil(this.jump)) {
        return false
      }
      return this._deltaPages >= 3
    },
    jumpOffset() {
      let offset = this.total - this.numPageItems
      return Math.max(offset, this.realInitOffset)
    },
  },
  methods: {
    endSuccess(prevItemsLength) {
      prevItemsLength = _.defaultTo(prevItemsLength, 0)
      let dataSize = this.items.length - prevItemsLength
      this.mescroll.endSuccess(dataSize, this.hasNext)
      let pageNum = Math.ceil(this.items.length / this.numPageItems) - 1
      this.mescroll.setPageNum(pageNum)
      if (!this.hasPrev) {
        this.mescroll.lockDownScroll(true)
      }
      if (!this.hasNext) {
        this.mescroll.lockUpScroll(true)
        this.mescroll.showNoMore()
      }
    },
    setInitUnreadPad() {
      if (!this.enableUnreadPad) { return }
      // 让未读故事恰好能撑满一页
      let pad = this.mescroll.upwarp
      if (this.hasNext || _.isNil(pad)) {
        return
      }
      let readedCount = 0
      for (let item of this.items) {
        if (item.offset < this.realInitOffset) {
          readedCount += 1
        } else {
          break
        }
      }
      let unreadCount = this.items.length - readedCount
      if (unreadCount <= 0) {
        return
      }
      let loadPrevHeight = this.reversed ? 0 : LOAD_PREV_HEIGHT
      let padHeight = this.pageSize - loadPrevHeight - unreadCount * this.itemSize - ITEM_LIST_PADDING
      if (padHeight <= MIN_PAD_HEIGHT) {
        return
      }
      pad.style.height = `${padHeight}px`
    },
    loadInit() {
      let initOffset = this.realInitOffset
      if (this.total > 0 && this.items.length <= this.numPageItems) {
        if (this.hasNext) {
          let offset = initOffset
          if (this.reversed) {
            offset = offset - this.numPageItems + 1
          }
          this.load({ offset: offset, size: this.numPageItems, isInit: true })
            .then(() => {
              this.loadNext()
            })
            .finally(() => {
              this.endSuccess()
              this.setInitUnreadPad()
              this.updateScrollTop(initOffset)
            })
          return
        } else if (this.hasPrev && this.items.length <= 0) {
          let size = Math.ceil(this.numPageItems * 0.8)
          let offset = Math.max(0, initOffset - size)
          if (this.reversed) {
            offset = Math.min(Math.max(0, initOffset), this.total - 1)
          }
          this.load({ offset, size, isInit: true }).finally(this.endSuccess)
          return
        }
      }
      this.endSuccess()
      this.setInitUnreadPad()
      this.updateScrollTop(initOffset)
    },
    updateScrollTop(offset) {
      // 按列表方向定位：顺序列表里目标行上方是更小的 offset，倒序列表里是更大的 offset
      let index = 0
      for (let item of this.items) {
        let isAbove = this.reversed ? item.offset > offset : item.offset < offset
        if (!isAbove) {
          break
        }
        index += 1
      }
      this.mescroll.setScrollTop(index * this.itemSize)
    },
    loadPrev() {
      if (this.isPrevLoading || !this.hasPrev || this.items.length <= 0) {
        this.mescroll.endDownScroll()
        return
      }
      let prevItemsLength = this.items.length
      this.isPrevLoading = true
      let offset;
      if (this.reversed) {
        offset = Math.min(this.total - 1, this.endOffset + 1)
      } else {
        offset = Math.max(0, this.beginOffset - this.numPageItems)
      }
      this.load({ offset, size: this.numPageItems }).then(() => {
        if (this.isLoadPrevByButton && this.mescroll) {
          this.$nextTick(() => {
            this.mescroll.setScrollTop(0)
          })
        }
      }).catch(() => {
        this.prevLoadError = true
      }).finally(() => {
        this.isPrevLoading = false
        this.isLoadPrevByButton = false
        this.endSuccess(prevItemsLength)
        this.mescroll.endDownScroll()
      })
    },
    getTopOffset() {
      if (!this.mescroll || this.items.length <= 0) {
        return null
      }
      let y = this.mescroll.getScrollTop()
      let index = Math.floor(y / this.itemSize)
      index = Math.min(Math.max(0, index), this.items.length - 1)
      let item = this.items[index]
      return _.isNil(item) ? null : item.offset
    },
    loadPrevByButton() {
      if (this.isPrevLoading || !this.hasPrev) {
        return
      }
      this.prevLoadError = false
      this.isLoadPrevByButton = true
      this.loadPrev()
    },
    loadNext() {
      if (this.isNextLoading || !this.hasNext || this.items.length <= 0) {
        return
      }
      let prevItemsLength = this.items.length
      this.isNextLoading = true
      let offset;
      if (this.reversed) {
        offset = Math.max(0, this.beginOffset - this.numPageItems)
      } else {
        offset = Math.min(this.total - 1, this.endOffset + 1)
      }
      this.load({ offset, size: this.numPageItems }).finally(() => {
        this.isNextLoading = false
        this.endSuccess(prevItemsLength)
      })
    },
    mescrollInit(mescroll) {
      this.mescroll = mescroll
      this.loadInit()
    },
    onMescrolDown(mescroll) {
      this.loadPrev()
    },
    onMescrolUp(page, mescroll) {
      this.loadNext()
    },
    onScroll(mescroll, y, isUp) {
      // 顶部预留了「加载更早」的位置，滚动一下就自然露出
      this.isScrolled = y > 0
      if (!isUp || this.isNextLoading || !this.hasNext || this.items.length <= 0) {
        return
      }
      let delta = (this.offsetAll - y) / this.pageSize
      if (delta < 2) {
        this.loadNext()
      }
    },
    jumpToLatest() {
      let offset = this.jumpOffset
      this.jump(this.jumpOffset)
      this.load({ offset: offset, size: this.numPageItems, resetLoadedOffset: true })
        .finally(this.endSuccess)
        .then(() => {
          this.updateScrollTop(offset)
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.mescroll {
  position: absolute;
  top: 0;
  bottom: 0;
  height: auto;
  max-width: @maxWidth;
}

// 旧的在前：顶部固定留出「加载更早的文章」的位置，吸顶条不会压住当前行
.mescroll.has-load-prev {
  top: 40 * @pr;
}

.item-list {
  padding-bottom: 2 * @pr;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
  transform: none;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translate3d(0, 50%, 0);
}

.load-prev {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40 * @pr;
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: fade(#ffffff, 96%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  color: @antBlue;
  font-size: 14 * @pr;
  cursor: pointer;
}

.jump-to-latest {
  position: absolute;
  bottom: 12 * @pr;
  left: 0;
  right: 0;
  width: 152 * @pr;
  margin: 0 auto;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  .mu-button {
    font-size: 15 * @pr;
    font-weight: normal;
    height: 32 * @pr;
  }

  .jump-icon {
    display: inline-block;
    font-weight: normal;
    margin-right: 4 * @pr;
  }
}
</style>
