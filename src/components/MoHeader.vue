<template>
  <div class="header" :class="{ 'header-border': border }">
    <slot></slot>
  </div>
</template>
<script>
export default {
  props: {
    border: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/common';

.header {
  display: flex;
  z-index: 100;
  height: 48 * @pr;

  align-items: center;
  justify-content: space-between;
  background: #ffffff;
}

.header-border {
  border-bottom: 1px solid @antLineGrey;
}
</style>
