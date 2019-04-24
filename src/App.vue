<template>
  <div id="app">
    <div id="timeit"></div>
    <router-view/>
    <AddFeedDialog></AddFeedDialog>
  </div>
</template>

<script>
import AddFeedDialog from '@/components/AddFeedDialog'

export default {
  data() {
    return {}
  },
  components: { AddFeedDialog },
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
