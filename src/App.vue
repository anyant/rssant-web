<template>
  <div id="app">
    <router-view/>
    <div v-loading.fullscreen.lock="loginLoading"></div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  async created() {
    this.$store.dispatch('autoLogin')
  },
  computed: {
    ...mapGetters(['loginLoading'])
  }
}
</script>

<style>
</style>
