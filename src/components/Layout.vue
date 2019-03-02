<template>
  <div class="layout">
    <slot></slot>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less" scoped>
.layout {
  max-width: 720px;
  min-width: 600px;
  margin: 0 auto;
}
</style>
