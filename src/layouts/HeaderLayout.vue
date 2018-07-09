<template>
  <div class="anyant-layout">
    <Header></Header>
    <div class="content">
      <slot ></slot>
    </div>
  </div>
</template>

<script>
import { Header } from '@/components/Header'

export default {
  components: { Header }
}
</script>

<style lang="less">
.anyant-layout {
  max-width: 920px;
  margin: 0 auto;
}
</style>
