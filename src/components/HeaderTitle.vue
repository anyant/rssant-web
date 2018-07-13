<template>
  <div class="title" :style="style">
    <slot></slot>
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
    style() {
      return { fontSize: `${this.fontSize}px` }
    }
  }
}
</script>

<style scoped>
.title {
  margin-left: 8px;
  margin-right: 8px;
  display: inline-block;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
