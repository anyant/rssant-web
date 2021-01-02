<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        <template v-if="!hasSelected">整理订阅 #{{ numFeeds }}</template>
        <template v-else>选中 {{ selectedFeedIds.length }} 项</template>
      </template>
      <mu-button
        flat
        class="action-group"
        @click="groupSelected"
        :class="{ 'action-group-disable': !hasSelected }"
      >
        <fa-icon icon="box" :size="15" />
      </mu-button>
      <mu-button
        flat
        class="action-delete"
        @click="deleteSelected"
        :class="{ 'action-delete-disable': !hasSelected }"
      >
        <fa-icon icon="trash" :size="16" />
      </mu-button>
      <MoGroupNameSelectorDialog
        :title="groupDialogTitle"
        :open.sync="openGroupDialog"
        @confirm="onSaveGroup"
      />
    </MoBackHeader>
    <div class="main" ref="mainRef">
      <div v-for="group in feedGroups" :key="group.name" class="feed-group">
        <div class="group-title">
          <mu-checkbox
            class="group-checkbox"
            @change="onCheckGroup(group)"
            :ripple="false"
            :input-value="isGroupHasCheccked(group)"
            :checked-icon="isGroupAllChecked(group) ? null : 'indeterminate_check_box'"
            :color="groupCheckboxColor"
          ></mu-checkbox>
          <div class="group-name" @click="onToggleGroup(group.name)">{{ group.name }}</div>
          <div class="group-info" @click="onToggleGroup(group.name)">
            <span class="group-size">{{ sizeOfGroup(group) }}</span>
            <fa-icon v-if="isGroupOpen(group.name)" class="group-icon" icon="angle-down" />
            <fa-icon v-else class="group-icon" icon="angle-right" />
          </div>
        </div>
        <template v-if="isGroupOpen(group.name)">
          <div v-for="item in group.items" :key="item.feed.id" class="feed-item">
            <mu-checkbox
              v-model="selectedFeedIds"
              :value="item.feed.id"
              :ripple="false"
              :color="feedCheckboxColor"
              class="feed-checkbox"
            ></mu-checkbox>
            <div class="feed-info" @click="onFeedClick(item.feed)">
              <div class="feed-info-row1">
                <div class="feed-title">{{ item.feed.title || item.feed.id }}</div>
                <div class="feed-issue">{{ getFeedIssueName(item.issue) }}</div>
              </div>
              <div class="feed-info-row2">
                <div class="feed-date">{{ formatFeedDate(item.feed) }}</div>
                <div class="feed-total-storys">
                  <span>{{ totalStorys(item.feed) }} 篇</span>
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
import { antGold, antInk } from '@/plugin/common'
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoLayout from '@/components/MoLayout.vue'
import MoGroupNameSelectorDialog from '@/components/MoGroupNameSelectorDialog.vue'

import { GROUP_MUSHROOM, getGroupId, getGroupName } from '../plugin/feedGroupHelper'

function isBlank(value) {
  return _.isNil(value) || value === ''
}

const FEED_ISSUE_TRASH = 'trash'
const FEED_ISSUE_ERROR_CONNECT = 'error-connect'
const FEED_ISSUE_ERROR_DENY = 'error-deny'
const FEED_ISSUE_ERROR_HTTP = 'error-http'
const FEED_ISSUE_ERROR_PARSE = 'error-parse'
const FEED_ISSUE_ERROR_STATUS = 'error-status'
const FEED_ISSUE_ZOMBY = 'zomby'

const FEED_ISSUE_LIST = [
  { key: FEED_ISSUE_TRASH, name: '无效订阅' },
  { key: FEED_ISSUE_ERROR_CONNECT, name: '无法连接' },
  { key: FEED_ISSUE_ERROR_DENY, name: '请求被拒' },
  { key: FEED_ISSUE_ERROR_HTTP, name: '请求失败' },
  { key: FEED_ISSUE_ERROR_PARSE, name: '无法解析' },
  { key: FEED_ISSUE_ERROR_STATUS, name: '状态异常' },
  { key: FEED_ISSUE_ZOMBY, name: '久未更新' },
]

const FEED_ISSUE_NAME_MAP = {}
FEED_ISSUE_LIST.forEach(x => (FEED_ISSUE_NAME_MAP[x.key] = x.name))

const FEED_ISSUE_LEVEL_MAP = {}
FEED_ISSUE_LIST.forEach((issue, index) => {
  FEED_ISSUE_LEVEL_MAP[issue.key] = -(FEED_ISSUE_LIST.length - index)
})

export default {
  components: { MoBackHeader, MoLayout, MoGroupNameSelectorDialog },
  props: {
    vid: {
      type: String,
      default: '/feed-clean',
    },
  },
  data() {
    return {
      groupCheckboxColor: antInk,
      feedCheckboxColor: antGold,
      selectedFeedIds: [],
      closedGroups: {},
      openGroupDialog: false,
    }
  },
  computed: {
    numFeeds() {
      return this.$API.feed.numFeeds
    },
    getFeedIssue() {
      function isTrashFeed(feed) {
        let noUpdate = isBlank(feed.dt_latest_story_published)
        return feed.total_storys <= 0 || noUpdate
      }
      function isErrorFeed(feed) {
        return _.lowerCase(feed.status) === 'error'
      }
      let now = new Date()
      function isZombyFeed(feed) {
        let dt_latest = new Date(feed.dt_latest_story_published)
        return differenceInDays(now, dt_latest) > 365
      }
      return feed => {
        if (isTrashFeed(feed)) {
          return FEED_ISSUE_TRASH
        }
        if (isErrorFeed(feed)) {
          if (!_.isNil(feed.response_status)) {
            if (feed.response_status < 0) {
              return FEED_ISSUE_ERROR_CONNECT
            } else if (feed.response_status === 401 || feed.response_status === 403) {
              return FEED_ISSUE_ERROR_DENY
            } else if (feed.response_status >= 400) {
              return FEED_ISSUE_ERROR_HTTP
            } else if (feed.response_status === 200 || feed.response_status === 304) {
              return FEED_ISSUE_ERROR_PARSE
            }
          }
          return FEED_ISSUE_ERROR_STATUS
        }
        if (isZombyFeed(feed)) {
          return FEED_ISSUE_ZOMBY
        }
        return null
      }
    },
    getFeedIssueName() {
      return key => _.defaultTo(FEED_ISSUE_NAME_MAP[key], key)
    },
    getFeedIssueLevel() {
      return key => _.defaultTo(FEED_ISSUE_LEVEL_MAP[key], 0)
    },
    feedGroups() {
      const self = this
      const feedAPI = this.$API.feed

      let soloItems = []
      let mushroomItems = []
      let customGroups = []

      function isMushroomFeed(feed) {
        return feedAPI.groupOf(feed) === GROUP_MUSHROOM
      }

      function sortFeedItems(items) {
        return _.sortBy(items, [
          item => self.getFeedIssueLevel(item.issue),
          item => new Date(item.feed.dt_latest_story_published),
          item => item.feed.id,
        ])
      }

      feedAPI.homeFeedList.forEach(feed => {
        let issue = self.getFeedIssue(feed)
        if (isMushroomFeed(feed)) {
          mushroomItems.push({ feed, issue })
        } else {
          soloItems.push({ feed, issue })
        }
      })

      feedAPI.feedGroups.forEach(group => {
        let items = []
        feedAPI.feedListOfGroup(group).forEach(feed => {
          items.push({ feed, issue: self.getFeedIssue(feed) })
        })
        customGroups.push({
          name: `分组:${group.name}`,
          items: sortFeedItems(items),
        })
      })

      let feedGroups = [
        {
          name: '无分组',
          items: sortFeedItems(soloItems),
        },
        {
          name: '品读',
          items: sortFeedItems(mushroomItems),
        },
      ]
      customGroups.forEach(x => feedGroups.push(x))

      feedGroups = _.filter(feedGroups, group => group.items.length > 0)
      return feedGroups
    },
    hasSelected() {
      return this.selectedFeedIds.length > 0
    },
    groupDialogTitle() {
      let count = this.selectedFeedIds.length
      return `设置 ${count} 个订阅的分组`
    },
    selectedFeedIdMap() {
      let selected = {}
      this.selectedFeedIds.forEach(x => (selected[x] = true))
      return selected
    },
    isGroupHasCheccked() {
      return group => {
        for (let item of group.items) {
          if (this.selectedFeedIdMap[item.feed.id]) {
            return true
          }
        }
        return false
      }
    },
    isGroupAllChecked() {
      return group => {
        for (let item of group.items) {
          if (!this.selectedFeedIdMap[item.feed.id]) {
            return false
          }
        }
        return true
      }
    },
    sizeOfGroup() {
      return group => {
        let total = group.items.length
        let numSelected = 0
        for (let item of group.items) {
          if (this.selectedFeedIdMap[item.feed.id]) {
            numSelected += 1
          }
        }
        return numSelected > 0 ? `${numSelected} / ${total}` : `${total}`
      }
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
    onCheckGroup(group) {
      let selected = {}
      this.selectedFeedIds.forEach(x => (selected[x] = true))
      if (this.isGroupAllChecked(group)) {
        for (let item of group.items) {
          delete selected[item.feed.id]
        }
      } else {
        for (let item of group.items) {
          selected[item.feed.id] = true
        }
      }
      this.selectedFeedIds = _.keys(selected)
    },
    groupSelected() {
      if (!this.hasSelected) {
        return
      }
      this.openGroupDialog = true
    },
    async onSaveGroup({ value, done }) {
      let group = getGroupId(value)
      try {
        await this.$API.feed.setAllGroup({ feedIds: this.selectedFeedIds, group: group })
        this.selectedFeedIds = []
        this.$toast.success({ message: '设置订阅分组成功!' })
      } catch (ex) {
        this.$toast.error(`设置订阅分组失败: ${ex.message}`)
      } finally {
        done()
      }
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
          let message = `成功删除 ${count} 个订阅!`
          this.$API.feed
            .deleteAll({ feedIds: this.selectedFeedIds })
            .then(() => {
              this.selectedFeedIds = []
              this.$toast.success({ message })
            })
            .catch(ex => {
              this.$toast.error(`删除订阅失败: ${ex.message}`)
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
    getFeedGroupName(feed) {
      return getGroupName(this.$API.feed.groupOf(feed))
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
      dt_first = isBlank(dt_first) ? '' : formatDate(dt_first)
      dt_latest = isBlank(dt_latest) ? '' : formatDate(dt_latest)
      if (isBlank(dt_first) && isBlank(dt_latest)) {
        return '未知时间'
      } else if (isBlank(dt_first) && !isBlank(dt_latest)) {
        return `未知时间 ~ ${dt_latest}`
      } else if (!isBlank(dt_first) && isBlank(dt_latest)) {
        return `${dt_first} ~ 未知时间`
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
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  background: lighten(@antBlue, 30%);
  border-top: 1px solid @antBackWhite;
  cursor: pointer;
}

.group-checkbox {
  flex-grow: 0;
  flex-shrink: 0;
  color: @antInk;
}

.group-name {
  color: darken(@antInk, 10%);
  flex-grow: 1;
  flex-shrink: 0;
}

.group-info {
  flex-grow: 0;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
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

.group-checkbox,
.feed-checkbox {
  position: relative;
  left: -4 * @pr;
}

.group-name,
.feed-info {
  flex: 1;
  margin-left: 4 * @pr;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.feed-info-row1,
.feed-info-row2 {
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

.feed-issue {
  min-width: 48 * @pr;
  font-size: 12 * @pr;
  flex-shrink: 0;
  margin-left: 4 * @pr;
  color: lighten(@antInk, 10%);
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
  right: -16 * @pr;
  margin-left: 4 * @pr;
  margin-right: 4 * @pr;
  width: 48 * @pr;
  height: 32 * @pr;
  min-width: auto;
}

.action-group {
  color: @antBlue;
  margin-right: 16 * @pr;
}

.action-delete {
  color: @antTextSemi;
}

.action-group-disable,
.action-delete-disable {
  color: @antTextGrey;
}

.action-group /deep/ .mu-button-wrapper,
.action-delete /deep/ .mu-button-wrapper {
  padding: 0 12 * @pr;
}
</style>
