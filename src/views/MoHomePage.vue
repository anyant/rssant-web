<template>
  <div class="app-layout" :class="{ 'is-reader': isReader }" :style="layoutStyle">
    <MoLayout grey header class="app-main" :style="mainStyle">
      <MoHome :reader="isReader"></MoHome>
    </MoLayout>
    <div v-if="hasBoard" class="app-board" :style="boardStyle">
      <template v-if="isReader">
        <div class="reader-stories">
          <keep-alive :include="keepAlivePages">
            <router-view :key="readerListKey" />
          </keep-alive>
        </div>
        <div class="reader-detail">
          <MoStoryReader panel :feed-id="readerStoryFeedId" :offset="readerOffset" />
        </div>
      </template>
      <template v-else>
        <MoLayout grey header v-if="showPlaceholder">
          <MoHeader></MoHeader>
          <MoBrandPlaceholder />
        </MoLayout>
        <keep-alive :include="keepAlivePages">
          <router-view :key="this.$route.fullPath" />
        </keep-alive>
      </template>
    </div>
  </div>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import MoHome from '@/components/MoHome'
import MoHeader from '@/components/MoHeader'
import MoBrandPlaceholder from '@/components/MoBrandPlaceholder'
import MoStoryReader from '@/components/MoStoryReader'
import { keepAlivePages } from '@/router'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'
import { shouldAutoEnterDiscover, markDiscoverAutoEntered } from '@/plugin/discover'

// 三栏阅读覆盖的列表页；其他页面仍用原来的两栏
const READER_ROUTES = ['StoryList', 'Mushroom', 'FeedGroup', 'Favorited']

export default {
  name: 'MoHomePage',
  components: { MoLayout, MoHome, MoHeader, MoBrandPlaceholder, MoStoryReader },
  data() {
    return {
      isReady: false,
      keepAlivePages: keepAlivePages,
    }
  },
  mounted() {
    rootStore.syncFeedLoadMushrooms().then(() => {
      this.isReady = true
      if (feedStore.numFeeds <= 0 && shouldAutoEnterDiscover()) {
        markDiscoverAutoEntered()
        this.$router.push({ path: '/discover', query: { mode: 'guide' } })
      }
    })
    // 宽屏直接打开阅读页时，进入三栏
    if (this.$LAYOUT.isReader && this.$route.name === 'Story' && this.$route.query.feed) {
      this.$router.replace({
        path: '/feed',
        query: { id: this.$route.query.feed, offset: this.$route.query.offset },
      })
    }
  },
  computed: {
    hasBoard() {
      return this.$LAYOUT.hasBoard
    },
    isReader() {
      return this.$LAYOUT.isReader && READER_ROUTES.includes(this.$route.name)
    },
    readerFeedId() {
      return this.$route.query.id || null
    },
    readerStoryFeedId() {
      return this.$route.query.feed || this.$route.query.id || null
    },
    readerOffset() {
      let offset = parseInt(this.$route.query.offset)
      return Number.isNaN(offset) ? null : offset
    },
    readerListKey() {
      return this.readerFeedId || this.$route.query.name || this.$route.name
    },
    showPlaceholder() {
      return this.isReady && this.hasBoard && this.$route.path === '/'
    },
    layoutStyle() {
      let marginWidth = (this.$LAYOUT.windowInnerWidth - this.$LAYOUT.appWidth) / 2
      let style = {
        position: 'fixed',
        left: `${marginWidth}px`,
        right: `${marginWidth}px`,
        top: 0,
        bottom: 0,
      }
      if (this.isReader) {
        style.display = 'flex'
      }
      return style
    },
    mainStyle() {
      if (this.isReader) {
        // 左栏 320 起步，宽屏按富余宽度线性长到 400
        return {
          width: 'clamp(320px, calc(320px + (100vw - 1280px) * 0.4), 400px)',
          flex: '0 0 auto',
          height: '100%',
          overflow: 'auto',
        }
      }
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
      if (this.isReader) {
        return {
          flex: '1 1 auto',
          minWidth: '0',
          height: '100%',
          display: 'flex',
        }
      }
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

  &.is-reader {
    overflow: hidden;
  }
}

.reader-stories {
  width: clamp(400px, 30vw, 450px);
  flex: 0 0 auto;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid @antLineGrey;
}

.reader-detail {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  background: #fff;
}
</style>
