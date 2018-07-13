<template>
  <Layout>
    <h1>Welcome to RSS Ant</h1>
    <h2>{{ msg }}</h2>
  </Layout>
</template>

<script>
import Layout from '@/layouts/Layout'

export default {
  components: {
    Layout
  },
  data() {
    return {
      msg: ''
    }
  },
  async created() {
    let response = await this.$api.get('/server')
    this.msg = `Server Ready: ${response.data.id}`
  }
}
</script>

<style scoped>
h1,
h2 {
  text-align: center;
  font-weight: normal;
}
</style>
