<template>
  <div
    class="layout"
    :class="{
      'layout-grey': grey, 
      'layout-header': header, 
      'layout-footer': footer, 
      'layout-has-board': board && hasBoard,
      'layout-not-board': !(board && hasBoard)
    }"
  >
    <div class="layout-wrapper">
      <div class="layout-main">
        <div class="layout-main-container">
          <slot></slot>
          <slot name="footer" v-if="footer"></slot>
        </div>
      </div>
      <div class="layout-board" v-if="board && hasBoard">
        <div class="layout-board-container">
          <slot name="board"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { hasBoard } from '@/plugin/common'

export default {
  props: {
    grey: {
      type: Boolean,
      default: false,
    },
    header: {
      type: Boolean,
      default: false,
    },
    footer: {
      type: Boolean,
      default: false,
    },
    board: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { hasBoard }
  },
}
</script>
<style lang="less" scoped>
@import '~@/styles/common';

.layout {
  position: relative;
  background: lighten(@antBackGrey, 5%) !important;
  background-color: lighten(@antBackGrey, 5%) !important;
}

.layout-header > .layout-wrapper > .layout-main > .layout-main-container {
  padding-top: 48 * @pr;
}

.layout-footer > .layout-wrapper > .layout-main > .layout-main-container {
  padding-bottom: 48 * @pr;
}

.layout-grey > .layout-wrapper > .layout-main {
  background: @antBackGrey;
}

.layout-main-container,
.layout-board-container {
  position: relative;
  min-height: 100vh;
}

.layout-not-board {
  > .layout-wrapper {
    max-width: @maxWidth;
    margin: 0 auto;
    overflow: hidden;
    background: #ffffff;
  }
}

.layout-has-board {
  > .layout-wrapper {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background: #ffffff;
  }

  > .layout-wrapper > .layout-main {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: @appWidth;
    overflow: scroll;
  }

  > .layout-wrapper > .layout-board {
    position: fixed;
    left: @appWidth;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: scroll;
  }
}
</style>
