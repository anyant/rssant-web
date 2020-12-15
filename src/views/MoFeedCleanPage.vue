<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        <template v-if=" selectedFeedIds.length <= 0">整理订阅</template>
        <template v-else>选中 {{ selectedFeedIds.length }} 项</template>
      </template>
      <mu-button
        flat
        class="action-group"
        @click="groupSelected"
        :class="{ 'action-group-disable': !hasSelected }"
      >
        <fa-icon icon="folder-plus" :size="18" />
      </mu-button>
      <mu-button
        flat
        class="action-delete"
        @click="deleteSelected"
        :class="{ 'action-delete-disable': !hasSelected }"
      >
        <fa-icon icon="trash" :size="15" />
      </mu-button>
      <MoHeaderMenu>
        <mu-button slot="default" icon class="menu-delete-all">
          <fa-icon icon="ellipsis-v" />
        </mu-button>
        <mu-list slot="content">
          <mu-list-item button @click="deleteAllFeed">
            <mu-list-item-title>删除全部</mu-list-item-title>
          </mu-list-item>
        </mu-list>
      </MoHeaderMenu>
    </MoBackHeader>
    <div class="main" ref="mainRef">
      <div v-for="group in feedGroups" :key="group.name" class="feed-group">
        <div class="group-title" @click="onToggleGroup(group.name)">
          <div class="group-name">{{ group.name }}</div>
          <div class="group-info">
            <span class="group-size">{{ group.feeds.length }}</span>
            <fa-icon v-if="isGroupOpen(group.name)" class="group-icon" icon="angle-down" />
            <fa-icon v-else class="group-icon" icon="angle-right" />
          </div>
        </div>
        <template v-if="isGroupOpen(group.name)">
          <div v-for="feed in group.feeds" :key="feed.id" class="feed-item">
            <mu-checkbox
              v-model="selectedFeedIds"
              :value="feed.id"
              :ripple="false"
              :color="checkboxColor"
              class="feed-checkbox"
            ></mu-checkbox>
            <div class="feed-info" @click="onFeedClick(feed)">
              <div class="feed-title">{{ feed.title || feed.id }}</div>
              <div class="feed-detail">
                <div class="feed-date">{{ formatFeedDate(feed) }}</div>
                <div class="feed-total-storys">
                  <span>{{ totalStorys(feed) }} 篇</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </MoLayout>
</template>
<script>
import Vue from 'vue'
import _ from 'lodash'
import { differenceInDays } from 'date-fns'
import { formatDate } from '@/plugin/datefmt'
import { antGold } from '@/plugin/common'
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoLayout from '@/components/MoLayout.vue'
import MoHeaderMenu from '@/components/MoHeaderMenu.vue'
import { GROUP_MUSHROOM } from '../plugin/feedGroupHelper'

export default {
  components: { MoBackHeader, MoLayout, MoHeaderMenu },
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
      closedGroups: {},
    }
  },
  computed: {
    feedGroups() {
      const feedAPI = this.$API.feed
      let trashFeeds = []
      let zombyFeeds = []
      let soloFeeds = []
      let mushroomFeeds = []
      let customGroups = []

      function isTrashFeed(feed) {
        return feed.total_storys <= 0 || _.isEmpty(feed.dt_latest_story_published)
      }

      let now = new Date()
      function isZombyFeed(feed) {
        let dt_latest = new Date(feed.dt_latest_story_published)
        return differenceInDays(now, dt_latest) > 365
      }

      function isMushroomFeed(feed) {
        return feedAPI.groupOf(feed) === GROUP_MUSHROOM
      }

      function sortFeeds(feeds) {
        return _.sortBy(feeds, [feed => new Date(feed.dt_latest_story_published), 'id'])
      }

      feedAPI.homeFeedList.forEach(feed => {
        if (isTrashFeed(feed)) {
          trashFeeds.push(feed)
        } else if (isZombyFeed(feed)) {
          zombyFeeds.push(feed)
        } else if (isMushroomFeed(feed)) {
          mushroomFeeds.push(feed)
        } else {
          soloFeeds.push(feed)
        }
      })

      feedAPI.feedGroups.forEach(group => {
        let groupFeeds = []
        feedAPI.feedListOfGroup(group).forEach(feed => {
          if (isTrashFeed(feed)) {
            trashFeeds.push(feed)
          } else if (isZombyFeed(feed)) {
            zombyFeeds.push(feed)
          } else {
            groupFeeds.push(feed)
          }
        })
        customGroups.push({
          name: `分组:${group.name}`,
          feeds: sortFeeds(groupFeeds),
        })
      })

      let feedGroups = [
        {
          name: '无效订阅',
          feeds: sortFeeds(trashFeeds),
        },
        {
          name: '久未更新',
          feeds: sortFeeds(zombyFeeds),
        },
        {
          name: '无分组',
          feeds: sortFeeds(soloFeeds),
        },
        {
          name: '品读',
          feeds: sortFeeds(mushroomFeeds),
        },
      ]
      customGroups.forEach(x => feedGroups.push(x))

      return feedGroups
    },
    hasSelected() {
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
      let closedGroups = this.$pageState.get('closedGroups')
      if (!_.isNil(closedGroups)) {
        _.forEach(_.toPairs(closedGroups), ([key, value]) => {
          Vue.set(this.closedGroups, key, value)
        })
      }
    })
  },
  savePageState() {
    this.$pageState.saveScrollTop({ el: this.$refs.mainRef })
    this.$pageState.set('selectedFeedIds', this.selectedFeedIds)
    this.$pageState.set('closedGroups', this.closedGroups)
    this.$pageState.commit()
  },
  methods: {
    groupSelected() {
      if (!this.hasSelected) {
        return
      }
      this.$toast.success({ message: '分组成功', time: 10000 })
    },
    deleteSelected() {
      if (!this.hasSelected) {
        return
      }
      let count = this.selectedFeedIds.length
      this.$confirm(`确定要删除 ${count} 个订阅？`, '提示', {
        type: 'warning',
        okLabel: '确定',
      }).then(({ result }) => {
        if (result) {
          let message = `成功删除 ${this.selectedFeedIds.length} 个订阅!`
          this.$API.feed.deleteAll({ feedIds: this.selectedFeedIds }).then(() => {
            this.selectedFeedIds = []
            this.$toast.success({ message, time: 5000 })
          })
        }
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
      this.$router.push(`/feed?id=${feed.id}`)
    },
    isGroupOpen(name) {
      return !this.closedGroups[name]
    },
    onToggleGroup(name) {
      Vue.set(this.closedGroups, name, !this.closedGroups[name])
    },
    totalStorys(feed) {
      if (feed.total_storys > 999) {
        return '999'
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

<style lang="less" scoped>
@import '~@/styles/common';

.group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32 * @pr;
  font-size: 14 * @pr;
  padding-left: 14 * @pr;
  padding-right: 16 * @pr;
  background: lighten(@antBlue, 30%);
  border-top: 1px solid @antBackWhite;
  cursor: pointer;
}

.group-name {
  color: darken(@antInk, 10%);
}

.group-info {
  display: flex;
  align-items: center;
  color: @antTextGrey;
}

.group-size {
  margin-right: 16 * @pr;
  font-size: 12 * @pr;
}

.group-icon {
  width: 12 * @pr;
  margin-right: 6 * @pr;
}

.feed-item {
  padding-top: 4 * @pr;
  padding-bottom: 4 * @pr;
  &:hover {
    background: lighten(@antGold, 48%);
  }
}

.feed-item {
  position: relative;
  height: 56 * @pr;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  display: flex;
  align-items: center;
  background: #fff;
}

.feed-checkbox {
  position: relative;
  left: -4 * @pr;
}

.feed-info {
  flex: 1;
  margin-left: 4 * @pr;
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

.feed-total-storys {
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

.action-group,
.action-delete {
  position: relative;
  margin-left: 4 * @pr;
  margin-right: 4 * @pr;
  width: 48 * @pr;
  height: 32 * @pr;
  color: @antGold;
  min-width: auto;
}

.action-group {
  margin-right: 12 * @pr;
}

.action-group-disable,
.action-delete-disable {
  color: @antTextGrey;
}

.acction-group /deep/ .mu-button-wrapper,
.action-delete /deep/ .mu-button-wrapper {
  padding: 0 12 * @pr;
}

.menu-delete-all {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-right: -4 * @pr;
  margin-left: 16 * @pr;
}
</style>
