<template>
  <div class="list-layout">
    <slot></slot>
  </div>
</template>
<style lang="less" scoped>
@import '~@/styles/common';

.list-layout {
  background: @antBackGrey;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 640 * @pr;
  margin-left: auto;
  margin-right: auto;
}
</style>
