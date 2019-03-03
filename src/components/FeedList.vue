<template>
  <div class="feed-list" v-loading="isLoading">
    <virtual-scroll-list
      ref="scroll-list"
      class="feed-list-content"
      :tobottom="onLoadNext"
      :size="size"
      :remain="remain"
    >
      <div :key="feed.id" v-for="feed in feedList">
        <mu-row class="feed">
          <mu-col class="feed-left">
            <mu-badge :content="feed.status" :color="statusColor(feed)"></mu-badge>
            <span
              class="feed-title"
              @click="onFeedClick(feed.id)"
            >{{ feed.title || feed.url + ' #' + feed.id }}</span>
          </mu-col>
          <mu-col span="4" class="feed-right">
            <mu-badge class="feed-num-unread" color="grey" :content="numUnread(feed)"></mu-badge>
            <span class="feed-time">{{ timeAgo(feed.dt_updated) }}</span>
            <mu-button flat color="primary" @click="onFeedDelete(feed.id)">删除</mu-button>
          </mu-col>
        </mu-row>
        <div class="divider"></div>
      </div>
    </virtual-scroll-list>
  </div>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

export default {
  data() {
    return { isLoading: true, size: 53, remain: 6 }
  },
  computed: {
    isLogined() {
      return this.$StoreAPI.user.isLogined()
    },
    feedList() {
      return this.$StoreAPI.feed.getFeedList()
    }
  },
  async mounted() {
    if (this.feedList.length > 0) {
      this.isLoading = false
    }
    this.remain = Math.floor(this.$el.clientHeight / this.size)
    try {
      // this.remain + 1 才能滚动到底触发 onLoadNext
      await this.$StoreAPI.feed.loadInitFeedList({ size: this.remain + 1 })
    } catch (error) {
      this.$message.error(error.message)
    } finally {
      this.isLoading = false
    }
    // fix scroll list not update
    this.$refs['scroll-list'].forceRender()
  },
  methods: {
    numUnread(feed) {
      if (lodash.isNil(feed.num_unread_storys)) {
        return '0'
      } else {
        return '' + feed.num_unread_storys
      }
    },
    statusColor(feed) {
      let color = {
        ready: 'success',
        updating: 'primary',
        error: 'error'
      }[feed.status]
      if (lodash.isNil(color)) {
        color = 'grey'
      }
      return color
    },
    timeAgo(date) {
      if (lodash.isEmpty(date)) {
        return ''
      }
      return moment(date).fromNow()
    },
    async onFeedDelete(feedId) {
      await this.$StoreAPI.feed.deleteFeed({ feedId: feedId })
    },
    async onFeedClick(feedId) {
      this.$router.push(`/feed/${feedId}`)
    },
    async onLoadNext() {
      if (!this.$StoreAPI.feed.hasNext()) {
        return
      }
      this.isLoading = true
      try {
        await this.$StoreAPI.feed.loadNextFeedList()
      } finally {
        setTimeout(() => {
          this.isLoading = false
        }, 200)
      }
    }
  }
}
</script>

<style scoped>
.feed-list {
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

.feed {
  box-sizing: border-box;
  margin-left: 16px;
  margin-right: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(9, 9, 9, 0.1);
}

.feed-left,
.feed-right {
  display: flex;
  align-items: center;
}

.feed-right {
  justify-content: flex-end;
}

.feed-title {
  display: inline-block;
  line-height: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 2px;
  flex: 1;
  margin-left: 4px;
  cursor: pointer;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-title:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.feed-num-unread {
  margin-left: 4px;
  margin-right: 8px;
}

.feed-time {
  width: 75px;
  text-align: right;
  display: inline-block;
  color: gray;
  margin-right: 4px;
}
</style>
