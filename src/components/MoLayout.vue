<template>
  <div
    class="layout"
    :class="{
      'layout-grey': grey, 
      'layout-header': header, 
      'layout-footer': footer, 
      'layout-has-board': hasBoard,
      'layout-not-board': !hasBoard
    }"
  >
    <div class="layout-main">
      <slot></slot>
      <slot name="footer" v-if="footer"></slot>
    </div>
    <div class="layout-board" v-if="hasBoard">
      <slot name="board"></slot>
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
  },
  data() {
    return { hasBoard }
  },
}
</script>
<style lang="less" scoped>
@import '~@/styles/common';

.layout {
  min-height: 100vh;
  overflow: hidden;
  background: #ffffff;
}

.layout-header .layout-main {
  margin-top: 48 * @pr;
}

.layout-footer .layout-main {
  padding-bottom: 48 * @pr;
}

.layout-grey .layout-main {
  background: @antBackGrey;
}

.layout-not-board {
  .layout-main {
    min-height: 100vh;
  }
}

.layout-has-board {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  .layout-main {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: @appWidth;
    overflow: scroll;
  }

  .layout-board {
    position: fixed;
    left: @appWidth;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: scroll;
  }
}
</style>
