<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        <template v-if="!hasSelected">整理订阅 #{{ numFeeds }}</template>
        <template v-else>选中 {{ selectedFeedIds.length }} 项</template>
      </template>
      <mu-button flat class="action-group" @click="groupSelected" :class="{ 'action-group-disable': !hasSelected }">
        <fa-icon icon="box" :size="15" />
      </mu-button>
      <mu-button flat class="action-delete" @click="deleteSelected" :class="{ 'action-delete-disable': !hasSelected }">
        <fa-icon icon="trash" :size="16" />
      </mu-button>
      <MoGroupNameSelectorDialog :title="groupDialogTitle" :open.sync="openGroupDialog" @confirm="onSaveGroup" />
    </MoBackHeader>
    <div class="main" ref="mainRef">
      <div v-for="group in feedGroups" :key="group.name" class="feed-group">
        <div class="group-title">
          <mu-checkbox class="group-checkbox" @change="onCheckGroup(group)" :ripple="false"
            :input-value="isGroupHasCheccked(group)"
            :checked-icon="isGroupAllChecked(group) ? null : 'indeterminate_check_box'"
            :color="groupCheckboxColor"></mu-checkbox>
          <div class="group-name" @click="onToggleGroup(group.name)">{{ group.name }}</div>
          <div class="group-info" @click="onToggleGroup(group.name)">
            <span class="group-size">{{ sizeOfGroup(group) }}</span>
            <fa-icon v-if="isGroupOpen(group.name)" class="group-icon" icon="angle-down" />
            <fa-icon v-else class="group-icon" icon="angle-right" />
          </div>
        </div>
        <template v-if="isGroupOpen(group.name)">
          <div v-for="item in group.items" :key="item.feed.id" class="feed-item">
            <mu-checkbox v-model="selectedFeedIds" :value="item.feed.id" :ripple="false" :color="feedCheckboxColor"
              class="feed-checkbox"></mu-checkbox>
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
import { antGold, antInk } from '@/plugin/common'
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoLayout from '@/components/MoLayout.vue'
import MoGroupNameSelectorDialog from '@/components/MoGroupNameSelectorDialog.vue'

import { getGroupId } from '../plugin/feedGroupHelper'
import { feedStore } from '@/store/feed'
import { rootStore } from '@/store/root'
import { feedGroupStore } from '@/store/feedGroup'

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
      return feedStore.numFeeds
    },
    getFeedIssue() {
      return feedGroupStore.getFeedIssue
    },
    getFeedIssueName() {
      return feedGroupStore.getFeedIssueName
    },
    getFeedIssueLevel() {
      return feedGroupStore.getFeedIssueLevel
    },
    feedGroups() {
      return feedGroupStore.feedGroups
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
    feedStore.sync().then(() => {
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
      this.$nextTick(() => {
        this.$pageState.restoreScrollTop({ el: this.$refs.mainRef })
      })
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
        await feedStore.setAllGroup({ feedIds: this.selectedFeedIds, group: group })
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
          rootStore
            .deleteAllFeed({ feedIds: this.selectedFeedIds })
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
      return feedGroupStore.getFeedGroupName(feed)
    },
    totalStorys(feed) {
      return feedGroupStore.totalStorysText(feed)
    },
    formatFeedDate(feed) {
      return feedGroupStore.formatFeedDate(feed)
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
