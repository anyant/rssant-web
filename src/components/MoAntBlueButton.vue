<template>
  <mu-button
    class="ant-blue-button"
    :color="antBlue"
    data-mu-loading-size="24"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot></slot>
  </mu-button>
</template>

<script>
import { antBlue } from '@/plugin/common'

export default {
  data() {
    return {
      antBlue,
    }
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.ant-blue-button {
  width: 144 * @pr;
  height: 36 * @pr;
  font-size: 16 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.ant-blue-button.disabled {
  background: @antBlue;
  color: #ffffff;
  opacity: 0.8;
}
</style>