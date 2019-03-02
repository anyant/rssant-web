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
    this.$StoreAPI.user.autoLogin()
  }
}
</script>

<style lang="less" scoped>
#timeit {
  position: fixed;
  top: 0;
  left: 4px;
  // z-index: 0;
}
</style>
