<template>
  <div class="feed-list">
    <mescroll
      ref="mescroll"
      class="feed-list-content"
      :down="mescrollDown"
      :up="mescrollUp"
      @init="mescrollInit"
    >
      <div :key="feed.id" v-for="(feed, index) in feedList">
        <mu-row class="feed">
          <mu-col class="feed-left">
            <span class="feed-status" :class="statusColor(feed)"></span>
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
    </mescroll>
  </div>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

export default {
  data() {
    let pageSize = window.innerHeight - 64 - 40
    let itemSize = 49
    let numPageItems = Math.ceil(pageSize / itemSize)
    this.$StoreAPI.$once('beforeRouteLeave', this.beforeRouteLeave.bind(this))
    return {
      isMenuOpen: false,
      menuOpenIndex: null,
      mescroll: null,
      isLoading: false,
      loadingPromise: null,
      pageSize: pageSize,
      itemSize: itemSize,
      numPageItems: numPageItems,
      currentScrollTop: 0,
      mescrollDown: {
        auto: false,
        callback: this.onMescrolDown.bind(this)
      },
      mescrollUp: {
        auto: false,
        callback: this.onMescrolUp.bind(this), // 上拉加载回调
        onScroll: this.onScroll.bind(this), // 滚动事件回调
        page: {
          num: 0, // 当前页
          size: numPageItems // 每页数据条数
        },
        htmlNodata: '<p class="upwarp-nodata">没有更多了</p>',
        noMoreSize: Math.ceil(numPageItems * 0.7)
      }
    }
  },
  computed: {
    isLogined() {
      return this.$StoreAPI.user.isLogined()
    },
    feedList() {
      return this.$StoreAPI.feed.getFeedList()
    },
    offsetAll() {
      return this.feedList.length * this.itemSize
    }
  },
  async mounted() {
    this.$StoreAPI.user.onLogin(this.onLogin.bind(this))
  },
  methods: {
    beforeRouteLeave() {
      this.$StoreAPI.feed.setScrollTop({ scrollTop: this.mescroll.getScrollTop() })
    },
    onMenuClose(index) {
      this.isMenuOpen = false
      this.menuOpenIndex = null
    },
    onMenuOpen(index) {
      this.isMenuOpen = true
      this.menuOpenIndex = index
    },
    onLogin() {
      this.loadInitFeedList()
    },
    numUnread(feed) {
      if (lodash.isNil(feed.num_unread_storys)) {
        return '0'
      } else {
        return '' + feed.num_unread_storys
      }
    },
    statusColor(feed) {
      let statusClass = 'feed-status-' + lodash.defaultTo(feed.status, 'pending')
      return [statusClass]
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
    mescrollInit(mescroll) {
      this.mescroll = mescroll
      mescroll.setScrollTop(this.$StoreAPI.feed.getScrollTop())
    },
    onMescrolDown(mescroll) {
      setTimeout(() => {
        mescroll.endSuccess()
      }, 500)
    },
    onMescrolUp(page, mescroll) {
      this.loadNextFeedList(mescroll)
    },
    onScroll(mescroll, y, isUp) {
      if (this.isLoading || !isUp) {
        return
      }
      let hasNext = this.$StoreAPI.feed.hasNext()
      if (!hasNext) {
        return
      }
      let delta = (this.offsetAll - y) / this.pageSize
      if (delta < 2) {
        this.loadNextFeedList()
      }
    },
    loadInitFeedList() {
      this.isLoading = true
      let promise = this.$StoreAPI.feed.loadInitFeedList({ size: this.numPageItems })
      this.loadingPromise = promise
      promise
        .catch(error => {
          this.$message.error(error.message)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    loadNextFeedList(mescroll) {
      let promise = null
      if (this.isLoading) {
        promise = this.loadingPromise
      } else {
        let hasNext = this.$StoreAPI.feed.hasNext()
        if (!hasNext) {
          if (!lodash.isNil(mescroll)) {
            mescroll.endSuccess(0, false)
          }
          return
        }
        this.isLoading = true
        promise = this.$StoreAPI.feed.loadNextFeedList({ size: this.numPageItems })
        this.loadingPromise = promise
      }
      if (!lodash.isNil(mescroll)) {
        promise
          .then(() => {
            let hasNext = this.$StoreAPI.feed.hasNext()
            mescroll.endSuccess(hasNext ? this.numPageItems : 0, hasNext)
          })
          .catch(() => {
            mescroll.endErr()
          })
      }
      promise.finally(() => {
        this.isLoading = false
      })
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
  border-bottom: 1px solid rgba(9, 9, 9, 0.1);
  height: 48px;
  overflow: hidden;
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

.feed-status {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: grey;
}

.feed-status.feed-status-ready {
  background: #66bb6a;
}
.feed-status.feed-status-updating {
  background: #2196f3;
}
.feed-status.feed-status-error {
  background: #f44336;
}
.feed-status.feed-status-pending {
  background: grey;
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
