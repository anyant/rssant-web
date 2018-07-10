<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  async created() {
    this.$store.dispatch('autoLogin')
  }
}
</script>

<style>
</style>
