<template>
  <mu-button v-if="isLogin" flat mini class="add-feed" @click="openDialog">
    <mu-icon value="add"></mu-icon>
    <span>订阅</span>
  </mu-button>
</template>

<script>
export default {
  computed: {
    isLogin() {
      return this.$store.getters.isLogin
    }
  },
  methods: {
    openDialog() {
      this.$store.commit('openAddFeedDialog')
    }
  }
}
</script>

<style lang="less" scoped>
.add-feed {
  span {
    font-weight: 700;
  }
}
</style>
