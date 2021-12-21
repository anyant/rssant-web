<template>
  <div class="app-layout" :style="layoutStyle">
    <MoLayout grey header class="app-main" :style="mainStyle">
      <MoHome></MoHome>
    </MoLayout>
    <div v-if="hasBoard" class="app-board" :style="boardStyle">
      <MoLayout grey header v-if="showPlaceholder">
        <MoHeader></MoHeader>
        <div class="rssant-placeholder">
          <div class="placeholder-title">蚁阅</div>
        </div>
      </MoLayout>
      <keep-alive :include="keepAlivePages">
        <router-view :key="this.$route.fullPath" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import MoHome from '@/components/MoHome'
import MoHeader from '@/components/MoHeader'
import { keepAlivePages } from '@/router'
import { rootStore } from '@/store/root'

export default {
  name: 'MoHomePage',
  components: { MoLayout, MoHome, MoHeader },
  data() {
    return {
      isReady: false,
      keepAlivePages: keepAlivePages,
    }
  },
  mounted() {
    rootStore.syncFeedLoadMushrooms().then(() => {
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
        left: `${marginWidth}px`,
        right: `${marginWidth}px`,
        top: 0,
        bottom: 0,
      }
    },
    mainStyle() {
      return {
        width: `${this.$LAYOUT.mainWidth}px`,
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
        width: `${boardWidth}px`,
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
  display: flex;
}

.rssant-placeholder .placeholder-title {
  font-size: 54 * @pr;
  margin: auto;
  font-family: Helvetica, Arial, sans-serif;
  color: darken(@antBackGrey, 20%);
  opacity: 0.33;
  cursor: default;
}
</style>