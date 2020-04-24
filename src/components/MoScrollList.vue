<template>
  <div class="scroll-list">
    <transition name="fade">
      <div class="jump-to-latest" v-if="needJump && !shouldAutoJump">
        <mu-button @click="jumpToLatest" :color="antBlue" :ripple="false">
          <i class="jump-icon fa fa-angle-double-down" aria-hidden="true"></i>看最新
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
      if (this.items.length <= 0) {
        return this.initOffset > 0
      }
      let firstOffset = this.items[0].offset
      let lastOffset = this.items[this.items.length - 1].offset
      return firstOffset > 0 || lastOffset - firstOffset + 1 > this.items.length
    },
    hasNext() {
      if (this.total <= 0) {
        return false
      }
      if (this.items.length <= 0) {
        return this.initOffset < this.total
      }
      let lastOffset = this.items[this.items.length - 1].offset
      return lastOffset < this.total - 1
    },
    _deltaPages() {
      let firstOffset = this.initOffset
      if (this.items.length > 0) {
        firstOffset = Math.max(firstOffset, this.items[0].offset)
      }
      let delta = (this.total - firstOffset) / this.numPageItems
      return Math.floor(Math.max(0, delta))
    },
    shouldAutoJump() {
      if (_.isNil(this.jump)) {
        return false
      }
      return this._deltaPages >= 10
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
      if (this.shouldAutoJump) {
        initOffset = this.jumpOffset
        this.jump(initOffset)
      }
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
      this.updateScrollTop()
    },
    updateScrollTop() {
      let scrollTop = 0
      for (let item of this.items) {
        if (item.offset < this.initOffset) {
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
      let lastOffset = this.items[this.items.length - 1].offset
      let firstOffset = this.items[0].offset
      let index = 1
      while (index < this.items.length && lastOffset - firstOffset > this.items.length - index) {
        firstOffset = this.items[index].offset
        index++
      }
      this.isPrevLoading = true
      let offset = Math.max(0, firstOffset - this.numPageItems)
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
      let lastOffset = this.items[this.items.length - 1].offset
      this.isNextLoading = true
      this.load({ offset: lastOffset + 1, size: this.numPageItems }).finally(() => {
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
      this.load({ offset: offset, size: this.numPageItems })
        .finally(this.endSuccess)
        .then(() => {
          this.updateScrollTop()
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.mescroll {
  position: fixed;
  top: 48 * @pr;
  bottom: 0;
  height: auto;
  max-width: @maxWidth;
}

.item-list {
  padding-bottom: 8 * @pr;
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
  position: fixed;
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
    font-size: 24 * @pr;
    font-weight: normal;
    margin-right: 4 * @pr;
  }
}
</style>
