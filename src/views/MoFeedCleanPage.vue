<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>清理订阅</template>
      <mu-button
        flat
        class="action-delete"
        @click="deleteSelected"
        :class="{ 'action-delete-disable': !canDelete }"
      >
        <fa-icon icon="trash" />
        <span class="action-delete-info">{{ selectedFeedIds.length }} 订阅</span>
      </mu-button>
      <mu-menu placement="bottom" popover-class="feed-clean-menu-popover">
        <mu-button icon class="menu-delete-all">
          <fa-icon icon="ellipsis-v" />
        </mu-button>
        <mu-list slot="content">
          <mu-list-item button @click="deleteAllFeed">
            <mu-list-item-title>删除全部</mu-list-item-title>
          </mu-list-item>
        </mu-list>
      </mu-menu>
    </MoBackHeader>
    <div class="feed-list" ref="mainRef">
      <div v-for="feed in feedList" :key="feed.id" class="feed-item">
        <mu-checkbox
          v-model="selectedFeedIds"
          :value="feed.id"
          :ripple="false"
          :color="checkboxColor"
          class="feed-checkbox"
        ></mu-checkbox>
        <div class="feed-info" @click="onFeedClick(feed)">
          <div class="feed-title">{{ feed.title }}</div>
          <div class="feed-detail">
            <div class="feed-date">{{ formatFeedDate(feed) }}</div>
            <div class="feed-total-storys">
              <span>{{ totalStorys(feed) }}#</span>
            </div>
            <div class="feed-dryness">
              <span>{{ (feed.dryness / 10).toFixed(0) }}</span>
              <mu-icon class="feed-dryness-icon" value="wb_sunny" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import { differenceInDays } from 'date-fns'
import { formatDate } from '@/plugin/datefmt'
import { antGold } from '@/plugin/common'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'

export default {
  components: { MoBackHeader, MoLayout },
  props: {
    vid: {
      type: String,
      default: '/feed-clean',
    },
  },
  data() {
    return {
      checkboxColor: antGold,
      selectedFeedIds: [],
    }
  },
  computed: {
    feedList() {
      let now = new Date()
      let badFeeds = []
      let goodFeeds = []
      this.$API.feed.feedList.forEach(feed => {
        if (feed.total_storys <= 0) {
          badFeeds.push(feed)
          return
        } else {
          if (_.isEmpty(feed.dt_latest_story_published)) {
            badFeeds.push(feed)
            return
          }
          let dt_latest = new Date(feed.dt_latest_story_published)
          if (differenceInDays(now, dt_latest) > 365) {
            badFeeds.push(feed)
            return
          }
        }
        goodFeeds.push(feed)
      })
      let feeds = this.sortFeeds(badFeeds).concat(this.sortFeeds(goodFeeds))
      return feeds
    },
    canDelete() {
      return this.selectedFeedIds.length > 0
    },
  },
  mounted() {
    this.$API.feed.sync().then(() => {
      this.$pageState.restoreScrollTop({ el: this.$refs.mainRef })
      let selectedFeedIds = this.$pageState.get('selectedFeedIds')
      if (!_.isNil(selectedFeedIds)) {
        selectedFeedIds.forEach(x => this.selectedFeedIds.push(x))
      }
    })
  },
  savePageState() {
    this.$pageState.saveScrollTop({ el: this.$refs.mainRef })
    this.$pageState.set('selectedFeedIds', this.selectedFeedIds)
    this.$pageState.commit()
  },
  methods: {
    sortFeeds(feeds) {
      return _.sortBy(feeds, ['dryness', 'total_storys', 'id'])
    },
    deleteSelected() {
      if (!this.canDelete) {
        return
      }
      let message = `成功删除 ${this.selectedFeedIds.length} 个订阅!`
      this.$API.feed.deleteAll({ feedIds: this.selectedFeedIds }).then(() => {
        this.selectedFeedIds = []
        this.$toast.success({ message, time: 10000 })
      })
    },
    deleteAllFeed() {
      this.$confirm(`要删除你的全部订阅吗？此操作不可恢复！`, '危险操作', {
        type: 'warning',
        okLabel: '删除全部订阅',
      }).then(({ result }) => {
        if (result) {
          this.$API.feed
            .deleteAll()
            .then(() => {
              this.$toast.success('删除成功')
            })
            .catch(error => {
              this.$toast.message('删除失败: ' + error.message)
            })
        }
      })
    },
    onFeedClick(feed) {
      this.$router.push(`/feed/${feed.id}`)
    },
    totalStorys(feed) {
      if (feed.total_storys > 999) {
        return '999+'
      } else {
        return `${feed.total_storys}`
      }
    },
    formatFeedDate(feed) {
      let dt_first = feed.dt_first_story_published
      let dt_latest = feed.dt_latest_story_published
      dt_first = _.isEmpty(dt_first) ? '' : formatDate(dt_first)
      dt_latest = _.isEmpty(dt_latest) ? '' : formatDate(dt_latest)
      if (_.isEmpty(dt_first) && _.isEmpty(dt_latest)) {
        return '未知时间'
      } else if (_.isEmpty(dt_first) && !_.isEmpty(dt_latest)) {
        return `${dt_first} ~ 未知时间`
      } else if (!_.isEmpty(dt_first) && _.isEmpty(dt_latest)) {
        return `很久以前 ~ ${dt_latest}`
      } else {
        return `${dt_first} ~ ${dt_latest}`
      }
    },
  },
}
</script>

<style lang="less">
@import '~@/styles/common';

.feed-clean-menu-popover {
  position: absolute;
  top: 48 * @pr !important;
  right: 8 * @pr;
  background: @antBackWhite;
  width: auto;
  padding: 0;
  border-radius: 4 * @pr;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
  .mu-list {
    padding: 0;
  }
}

.feed-clean-menu-popover .mu-item {
  height: 48 * @pr;
  font-weight: bold;
}
</style>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-list {
  padding-bottom: 8 * @pr;
}

.feed-item {
  margin-top: 8 * @pr;
}

.feed-item {
  position: relative;
  height: 48 * @pr;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  display: flex;
  align-items: center;
  background: #fff;
}

.feed-checkbox {
  position: relative;
  left: -4px;
}

.feed-info {
  flex: 1;
  margin-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.feed-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 1.33;
}

.feed-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15 * @pr;
}

.feed-total-storys,
.feed-dryness {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 48 * @pr;
  margin-left: 12 * @pr;
  font-size: 12 * @pr;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;

  .feed-dryness-icon {
    font-size: 14 * @pr;
    margin-left: 1px;
  }
}

.feed-date {
  flex: 1;
  width: 64 * @pr;
  font-size: 12 * @pr;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;
}

.action-delete {
  position: relative;
  margin-left: 4px;
  margin-right: 4px;
  right: -16 * @pr;
  height: 32 * @pr;
  font-size: 14 * @pr;
  color: @antGold;
  min-width: auto;
  .action-delete-info {
    margin-left: 4px;
    font-weight: bold;
  }
}

.action-delete-disable {
  color: @antTextGrey;
}

.menu-delete-all {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-right: -4 * @pr;
  margin-left: 16 * @pr;
}
</style>

<style lang="less">
@import '~@/styles/common';

.action-delete.mu-flat-button .mu-button-wrapper {
  padding: 0 12px;
}
</style>