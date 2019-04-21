<template>
  <div class="layout" :class="{ 'layout-grey': grey, 'layout-header': header }">
    <div>
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    grey: {
      type: Boolean,
      default: false
    },
    header: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/common';

.layout {
  min-height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

.layout-header {
  padding-top: 48 * @pr;
}

.layout-grey {
  background: @antBackGrey;
}
</style>
