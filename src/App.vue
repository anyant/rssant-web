<template>
  <div id="app">
    <div id="timeit"></div>
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  async created() {}
}
</script>

<style lang="less">
@import '~@/styles/common';

#timeit {
  position: fixed;
  top: 0;
  left: 4px;
}

#app {
  min-width: 300 * @pr;
  max-width: 640 * @pr;
  margin: 0 auto;
}
</style>
