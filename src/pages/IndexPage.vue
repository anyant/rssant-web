<template>
  <div>
      <DefaultLayout>
        <h1>Welcome to RSS Ant</h1>
        <h2>{{ msg }}</h2>
      </DefaultLayout>
  </div>
</template>

<script>
import { DefaultLayout } from '@/layouts/'

export default {
  components: {
    DefaultLayout
  },
  data() {
    return {
      msg: ''
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
  text-align: center;
  font-weight: normal;
}
</style>
