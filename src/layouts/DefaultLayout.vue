<template>
  <div class="layout">
    <Header></Header>
    <slot></slot>
  </div>
</template>

<script>
import { Header } from '@/components/Header'

export default {
  components: { Header }
}
</script>

<style scoped lang="less">
.layout {
  max-width: 920px;
  margin: 0 auto;
}
</style>
