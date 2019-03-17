<template>
  <div class="feed-list" v-loading="isLoading" data-mu-loading-overlay-color="rgba(0, 0, 0, 0)">
    <virtual-scroll-list
      ref="scroll-list"
      class="feed-list-content"
      :tobottom="onLoadNext"
      :size="size"
      :remain="remain"
    >
      <div :key="feed.id" v-for="(feed, index) in feedList">
        <mu-row class="feed">
          <mu-col class="feed-left">
            <mu-badge :content="feed.status" :color="statusColor(feed)"></mu-badge>
            <span
              class="feed-title"
              @click="onFeedClick(feed.id)"
            >{{ feed.title || feed.url + ' #' + feed.id }}</span>
          </mu-col>
          <mu-col span="4" class="feed-right">
            <mu-badge
              class="feed-num-unread"
              color="grey"
              :content="numUnread(feed)"
              :style="{visibility: parseInt(numUnread(feed)) > 0 ? 'visible': 'hidden'}"
            ></mu-badge>
            <span class="feed-time">{{ timeAgo(feed.dt_updated) }}</span>
            <mu-menu
              :open="isMenuOpen && menuOpenIndex === index"
              @close="onMenuClose(index)"
              @open="onMenuOpen(index)"
              placement="bottom-end"
            >
              <mu-button class="operator" icon>
                <mu-icon value="more_horiz"></mu-icon>
              </mu-button>
              <mu-list slot="content" class="menu-items">
                <mu-list-item button @click="onFeedReaded(feed.id)">
                  <mu-list-item-title>已读</mu-list-item-title>
                </mu-list-item>
                <mu-list-item button @click="onFeedDelete(feed.id)">
                  <mu-list-item-title class="menu-delete-feed">删除</mu-list-item-title>
                </mu-list-item>
              </mu-list>
            </mu-menu>
          </mu-col>
        </mu-row>
        <div class="divider"></div>
      </div>
    </virtual-scroll-list>
  </div>
</template>

<script>
import Vue from 'vue'
import lodash from 'lodash'
import moment from 'moment'

export default {
  data() {
    return {
      isLoading: false,
      size: 53,
      remain: 6,
      isMenuOpen: false,
      menuOpenIndex: null
    }
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
    this.$StoreAPI.user.onLogin(this.onLogin.bind(this))
  },
  methods: {
    onMenuClose(index) {
      this.isMenuOpen = false
      this.menuOpenIndex = null
    },
    onMenuOpen(index) {
      this.isMenuOpen = true
      this.menuOpenIndex = index
    },
    async onLogin() {
      if (this.feedList.length > 0) {
        this.isLoading = false
      }
      this.remain = Math.floor(this.$el.clientHeight / this.size)
      this.isLoading = true
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
    async onFeedReaded(feedId) {
      await this.$StoreAPI.feed.setFeedReaded({ feedId: feedId })
      this.onMenuClose()
    },
    async onFeedDelete(feedId) {
      await this.$StoreAPI.feed.deleteFeed({ feedId: feedId })
      this.onMenuClose()
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

<style scoped lang="less">
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
  height: 48px;
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

.operator {
  margin-left: 8px;
}

.menu-delete-feed {
  color: #e67e22;
}
</style>
