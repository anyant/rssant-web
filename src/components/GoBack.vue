<template>
  <div class="arrow-back" @click="goBack">
    <mu-icon size="36" value="arrow_back"></mu-icon>
  </div>
</template>

<script>
export default {
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style lang="less" scoped>
.arrow-back {
  display: inline-block;
  padding: 6px 8px 10px 0px;
  height: 48px;
  line-height: 48px;
  cursor: pointer;
}
</style>
