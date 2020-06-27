<template>
  <div id="app">
    <div id="timeit"></div>
    <keep-alive :include="keepAlivePages">
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
import { hasBoard } from '@/plugin/common'

export default {
  data() {
    return {
      hasBoard,
      keepAlivePages: ['MoHomePage', 'MoAccountPage', 'MoFeedCreationPage'],
    }
  },
  async created() {},
}
</script>

<style lang="less">
@import '~@/styles/common';
@import '~@/styles/markdown';

#timeit {
  position: fixed;
  z-index: 999;
  bottom: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.5);
}

#timeit,
#timeit * {
  outline: none !important;
}

#app {
  position: relative;
  min-width: @minWidth;
}
</style>
