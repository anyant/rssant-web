<template>
  <div class="story-list">
    <mescroll
      ref="mescroll"
      class="story-list-content"
      :down="mescrollDown"
      :up="mescrollUp"
      @init="mescrollInit"
    >
      <div
        class="story"
        :key="story.id"
        v-for="story in storyList"
        :style="{opacity: story.is_readed ? 0.5: 1.0}"
        @click="onStoryClick(story)"
      >
        <span class="story-title">{{ story.title }}</span>
        <span class="story-time">{{ timeAgo(story.dt_updated) }}</span>
        <mu-button class="story-favorite" icon @click.stop="toggleFavorite(story)">
          <mu-icon
            :value="story.is_favorited?'star':'star_border'"
            :color="story.is_favorited?'#F39C12':'#999'"
          ></mu-icon>
        </mu-button>
      </div>
    </mescroll>
  </div>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

export default {
  data() {
    let pageSize = window.innerHeight - 64 - 40
    let itemSize = 57
    let numPageItems = Math.ceil(pageSize / itemSize)
    this.$StoreAPI.$once('beforeRouteLeave', this.beforeRouteLeave.bind(this))
    return {
      isLoading: true,
      loadingPromise: null,
      pageSize: pageSize,
      itemSize: itemSize,
      numPageItems: numPageItems,
      mescrollDown: {
        auto: false,
        callback: this.onMescrolDown
      },
      mescrollUp: {
        auto: false,
        callback: this.onMescrolUp, // 上拉加载回调
        onScroll: this.onScroll, // 滚动事件回调
        page: {
          num: 0, // 当前页
          size: numPageItems // 每页数据条数
        },
        htmlNodata: '<p class="upwarp-nodata">没有更多了</p>',
        noMoreSize: Math.ceil(numPageItems * 0.5)
      }
    }
  },
  computed: {
    isLogined() {
      return this.$StoreAPI.user.isLogined()
    },
    storyList() {
      return this.$StoreAPI.story.getStoryList({ feedId: this.feedId })
    },
    feedId() {
      return this.$route.params.feedId
    },
    offsetAll() {
      return this.storyList.length * this.itemSize
    }
  },
  async mounted() {
    if (this.storyList.length > 0) {
      this.isLoading = false
      return
    }
    this.isLoading = true
    let promise = this.$StoreAPI.story.loadInitStoryList({ feedId: this.feedId, size: this.numPageItems })
    this.loadingPromise = promise
    promise.finally(() => {
      this.isLoading = false
      this.loadingPromise = null
    })
  },
  methods: {
    beforeRouteLeave() {
      this.$StoreAPI.story.setScrollTop({
        feedId: this.feedId,
        scrollTop: this.mescroll.getScrollTop()
      })
    },
    timeAgo(date) {
      if (lodash.isEmpty(date)) {
        return ''
      }
      return moment(date).fromNow()
    },
    onStoryClick(story) {
      this.$router.push(`/story/${story.id}`)
    },
    toggleFavorite(story) {
      let is_favorited = story.is_favorited
      // toggle
      story.is_favorited = !is_favorited
      this.$StoreAPI.story
        .setStoryFavorited({
          storyId: story.id,
          is_favorited: !is_favorited
        })
        .catch(() => {
          // rollback
          story.is_favorited = is_favorited
        })
    },
    mescrollInit(mescroll) {
      this.mescroll = mescroll
      mescroll.setScrollTop(this.$StoreAPI.story.getScrollTop({ feedId: this.feedId }))
    },
    onMescrolDown(mescroll) {
      setTimeout(() => {
        mescroll.endSuccess()
      }, 500)
    },
    onMescrolUp(page, mescroll) {
      this.onLoadNext(mescroll)
    },
    onScroll(mescroll, y, isUp) {
      if (this.isLoading || !isUp) {
        return
      }
      let hasNext = this.$StoreAPI.story.hasNext({ feedId: this.feedId })
      if (!hasNext) {
        return
      }
      let delta = (this.offsetAll - y) / this.pageSize
      if (delta < 2) {
        this.onLoadNext()
      }
    },
    async onLoadNext(mescroll) {
      let hasNext = this.$StoreAPI.story.hasNext({ feedId: this.feedId })
      if (!hasNext) {
        if (!lodash.isNil(mescroll)) {
          mescroll.endSuccess(0, false)
        }
        return
      }
      let promise = null
      if (this.isLoading) {
        promise = this.loadingPromise
      } else {
        this.isLoading = true
        promise = this.$StoreAPI.story.loadNextStoryList({ feedId: this.feedId, size: this.numPageItems })
        this.loadingPromise = promise
      }
      if (!lodash.isNil(mescroll)) {
        promise
          .then(() => {
            let hasNext = this.$StoreAPI.story.hasNext({ feedId: this.feedId })
            mescroll.endSuccess(hasNext ? this.numPageItems : 0, hasNext)
          })
          .catch(() => {
            mescroll.endErr()
          })
      }
      promise.finally(() => {
        this.isLoading = false
        this.loadingPromise = null
      })
    }
  }
}
</script>

<style lang="less" scoped>
.story-list {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 720px;
  min-width: 600px;
  margin: 20px auto;
  overflow-y: auto;
}

.story {
  display: flex;
  align-items: center;
  padding: 4px 4px;
  margin: 0 16px;
  border-bottom: 1px solid rgba(9, 9, 9, 0.05);
  cursor: pointer;
}

.story:hover {
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #fff;
}

.story-title {
  display: inline-block;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-time {
  display: inline-block;
  color: gray;
}

.story-favorite {
  margin-left: 8px;
}
</style>
