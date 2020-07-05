<template>
  <div class="app-layout" :style="layoutStyle">
    <MoLayout grey header class="app-main" :style="mainStyle">
      <MoHome></MoHome>
    </MoLayout>
    <div v-if="hasBoard" class="app-board" :style="boardStyle">
      <div class="rssant-placeholder" v-if="showPlaceholder">
        <div class="placeholder-title">蚁阅</div>
      </div>
      <router-view :key="this.$route.path" />
    </div>
  </div>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import MoHome from '@/components/MoHome'

export default {
  name: 'MoHomePage',
  components: { MoLayout, MoHome },
  data() {
    return {
      isReady: false,
    }
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms().then(() => {
      this.isReady = true
    })
  },
  computed: {
    hasBoard() {
      return this.$LAYOUT.hasBoard
    },
    showPlaceholder() {
      return this.isReady && this.hasBoard && this.$route.path === '/'
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
  position: absolute;
  width: 100%;
}

.rssant-placeholder .placeholder-title {
  font-size: 54px;
  margin: auto;
  font-family: Helvetica, Arial, sans-serif;
  color: darken(@antBackGrey, 5%);
}
</style>