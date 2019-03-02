<template>
  <mu-button v-if="isLogined" flat mini class="add-feed" @click="openDialog">
    <mu-icon value="add"></mu-icon>
    <span>订阅</span>
  </mu-button>
</template>

<script>
import { API as DialogAPI } from '@/components/AddFeedDialog'

export default {
  computed: {
    isLogined() {
      return this.$StoreAPI.user.isLogined()
    }
  },
  methods: {
    openDialog() {
      DialogAPI.open()
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
