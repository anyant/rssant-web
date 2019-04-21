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
  async created() {
    this.$StoreAPI.user.login().catch(() => {})
  }
}
</script>

<style lang="less">
#timeit {
  position: fixed;
  top: 0;
  left: 4px;
}

#app {
  max-width: 640px;
  margin: 0 auto;
}
</style>
