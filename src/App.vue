<template>
  <div id="app">
    <div id="timeit"></div>
    <router-view/>
    <div v-loading.fullscreen.lock="loginLoading"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  async created() {
    this.$store.dispatch('autoLogin')
  },
  computed: {
    ...mapGetters(['loginLoading'])
  }
}
</script>

<style lang="less" scoped>
#timeit {
  position: fixed;
  top: 0;
  left: 4px;
}
</style>
