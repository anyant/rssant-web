<template>
  <div id="app">
    <div id="timeit"></div>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {}
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
  min-width: @minWidth;
  max-width: @maxWidth;
  margin: 0 auto;
}
</style>
