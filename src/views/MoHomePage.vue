<template>
  <div class="app-layout" :style="layoutStyle">
    <MoLayout grey header class="app-main" :style="mainStyle">
      <MoHome></MoHome>
    </MoLayout>
    <div v-if="hasBoard" class="app-board" :style="boardStyle">
      <div class="rssant-placeholder">
        <div class="placeholder-title">蚁阅</div>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import MoHome from '@/components/MoHome'

export default {
  components: { MoLayout, MoHome },
  data() {
    return {}
  },
  computed: {
    hasBoard() {
      return this.$LAYOUT.hasBoard
    },
    layoutStyle() {
      let marginWidth = (this.$LAYOUT.windowInnerWidth - this.$LAYOUT.appWidth) / 2
      return {
        position: 'fixed',
        left: marginWidth + 'px',
        right: marginWidth + 'px',
        top: 0,
        bottom: 0,
      }
    },
    mainStyle() {
      return {
        width: this.$LAYOUT.mainWidth + 'px',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        overflow: 'auto',
      }
    },
    boardStyle() {
      let boardWidth = this.$LAYOUT.boardWidth - 8
      return {
        width: boardWidth + 'px',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        overflow: 'auto',
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.app-layout {
  background: @antBackGrey;
}

.rssant-placeholder {
  height: 100vh;
  display: flex;
}

.rssant-placeholder .placeholder-title {
  font-size: 54px;
  margin: auto;
  font-family: Helvetica, Arial, sans-serif;
  color: darken(@antBackGrey, 5%);
}
</style>