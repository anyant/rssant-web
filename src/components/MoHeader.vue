<template>
  <div class="header" :class="{ 'header-border': border, 'header-board': board && hasBoard }">
    <slot></slot>
  </div>
</template>
<script>
import { hasBoard } from '@/plugin/common'

export default {
  props: {
    border: {
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

.header {
  position: fixed;
  top: 0;
  width: 100%;
  max-width: @maxWidth;
  z-index: 100;
  display: flex;
  height: 48 * @pr;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
}

.header-board {
  width: @appWidth;
}

.header-border {
  border-bottom: 1px solid @antLineGrey;
}
</style>
