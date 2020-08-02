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
    <mescroll
      ref="mescroll"
      class="mescroll"
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
import _ from 'lodash'
import { antBlue } from '@/plugin/common'

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
      default: 0,
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
  },
  data() {
    let pageSize = window.innerHeight - 48
    let numPageItems = Math.ceil(pageSize / this.itemSize)
    return {
      pageSize: pageSize,
      numPageItems: numPageItems,
      isPrevLoading: false,
      isNextLoading: false,
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
    hasPrev() {
      if (this.total <= 0) {
        return false
      }
      if (this.items.length <= 0 || _.isNil(this.beginOffset)) {
        return this.initOffset > 0
      }
      return this.beginOffset > 0
    },
    hasNext() {
      if (this.total <= 0) {
        return false
      }
      if (this.items.length <= 0 || _.isNil(this.endOffset)) {
        return this.initOffset < this.total
      }
      return this.endOffset < this.total - 1
    },
    _deltaPages() {
      let endOffset = _.defaultTo(this.endOffset, this.initOffset)
      let beginOffset = _.defaultTo(this.beginOffset, this.initOffset)
      // consider preloaded pages even when it not loaded yet
      endOffset = Math.max(endOffset, beginOffset + this.numPageItems * 2)
      let delta = (this.total - endOffset) / this.numPageItems
      return Math.floor(Math.max(0, delta))
    },
    needJump() {
      if (_.isNil(this.jump)) {
        return false
      }
      return this._deltaPages >= 3
    },
    jumpOffset() {
      let offset = this.total - this.numPageItems
      return Math.max(offset, this.initOffset)
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
    loadInit() {
      let initOffset = this.initOffset
      if (this.total > 0 && this.items.length <= this.numPageItems) {
        if (this.hasNext) {
          this.load({ offset: initOffset, size: this.numPageItems })
            .then(() => {
              this.loadNext()
            })
            .finally(this.endSuccess)
          return
        } else if (this.hasPrev && this.items.length <= 0) {
          let size = Math.ceil(this.numPageItems * 0.8)
          let offset = Math.max(0, initOffset - size)
          this.load({ offset, size }).finally(this.endSuccess)
          return
        }
      }
      this.endSuccess()
      this.updateScrollTop(initOffset)
    },
    updateScrollTop(offset) {
      let scrollTop = 0
      for (let item of this.items) {
        if (item.offset < offset) {
          scrollTop += this.itemSize
        } else {
          break
        }
      }
      this.mescroll.setScrollTop(scrollTop)
    },
    loadPrev() {
      if (this.isPrevLoading || !this.hasPrev || this.items.length <= 0) {
        this.mescroll.endDownScroll()
        return
      }
      let prevItemsLength = this.items.length
      this.isPrevLoading = true
      let offset = Math.max(0, this.beginOffset - this.numPageItems)
      this.load({ offset, size: this.numPageItems }).finally(() => {
        this.isPrevLoading = false
        this.endSuccess(prevItemsLength)
        this.mescroll.endDownScroll()
      })
    },
    loadNext() {
      if (this.isNextLoading || !this.hasNext || this.items.length <= 0) {
        return
      }
      let prevItemsLength = this.items.length
      this.isNextLoading = true
      this.load({ offset: this.endOffset + 1, size: this.numPageItems }).finally(() => {
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
