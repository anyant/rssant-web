<template>
  <div
    class="layout"
    :class="{ 'layout-grey': grey, 'layout-header': header, 'layout-footer': footer }"
  >
    <div>
      <slot></slot>
      <slot name="footer" v-if="footer"></slot>
    </div>
  </div>
</template>
<script>
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

.layout-footer {
  padding-bottom: 48 * @pr;
}

.layout-grey {
  background: @antBackGrey;
}
</style>
