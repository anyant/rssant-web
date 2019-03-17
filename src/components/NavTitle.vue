<template>
  <div class="nav-title">
    <div class="arrow-back" @click="goBack">
      <mu-icon size="36" value="arrow_back"></mu-icon>
    </div>
    <div class="title" :style="titleStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fontSize: {
      type: Number,
      default: 20
    }
  },
  computed: {
    titleStyle() {
      return { fontSize: `${this.fontSize}px` }
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style lang="less" scoped>
.nav-title {
  display: flex;
}
.arrow-back {
  display: inline-block;
  padding: 6px 0px 10px 0px;
  height: 48px;
  line-height: 48px;
  cursor: pointer;
  z-index: 100;
}
.title {
  margin-left: 8px;
  margin-right: 8px;
  line-height: 48px;
  display: inline-block;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
