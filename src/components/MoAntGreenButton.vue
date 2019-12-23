<template>
  <mu-button
    class="ant-green-button"
    :color="antGreen"
    flat
    data-mu-loading-size="24"
    v-bind="$props"
    v-on="$listeners"
  >
    <slot></slot>
  </mu-button>
</template>

<script>
import { antGreen } from '@/plugin/common'

export default {
  data() {
    return {
      antGreen
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.ant-green-button {
  height: 32 * @pr;
  font-size: 15 * @pr;
  border: solid 1px @antLineGrey;
}
</style>