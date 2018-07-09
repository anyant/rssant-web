<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Welcome to RSS Ant'
    }
  },
  async mounted() {
    let response = await this.$api.get('/server')
    this.msg = `Server Ready: ${response.data.id}`
  }
}
</script>

<style scoped>
h1,
h2 {
  font-weight: normal;
}
</style>
