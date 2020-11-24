<template>
  <mu-popover
    class="header-tip"
    :class="{'tip-hidden':!open}"
    :open="open"
    v-on:update:open="updateOpen"
    :trigger="trigger"
    placement="bottom"
  >
    <span class="tip-triangle"></span>
    <div class="tip-info">{{ content }}</div>
  </mu-popover>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: true,
    },
    trigger: {
      type: HTMLElement,
      required: false,
    },
  },
  methods: {
    updateOpen(event) {
      this.$emit('update:open', event)
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.header-tip {
  margin-top: 8 * @pr;
  box-shadow: none;
  background-color: @antBackDark;
  opacity: 0.9;
  overflow: visible;
  cursor: default;
}

.tip-hidden {
  display: none;
}

.header-tip.mu-popover.transition-bottom {
  transform: none;
  transform-origin: unset;
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

.tip-info {
  font-size: 12 * @pr;
  line-height: 22 * @pr;
  padding: 4 * @pr 8 * @pr;
  color: @antTextWhite;
  border-radius: 2 * @pr;
}

.tip-triangle {
  // https://juejin.im/post/5cdc0458f265da03a1584fd0
  display: block;
  height: 14 * @pr;
  width: 14 * @pr;
  background-color: inherit;
  border: inherit;
  position: absolute;
  top: -6 * @pr;
  left: calc(50% - 7 * @pr);
  // ---start---
  clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
  transform: rotate(135deg);
  // ---end---
  border-radius: 0 0 0 2 * @pr;
}
</style>
