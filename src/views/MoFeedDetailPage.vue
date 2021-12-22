<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>{{ feedTitle }}</template>
      <mu-button icon class="action-delete" @click="deleteFeed">
        <fa-icon class="action-icon" icon="trash" />
      </mu-button>
    </MoBackHeader>
    <div class="feed-info">
      <MoFeedDetailInfoItem
        class="title-item"
        name="标题"
        :value="feedTitle"
        editable
        @save="onSaveTitle"
      ></MoFeedDetailInfoItem>
      <MoFeedDetailInfoItem
        ref="groupItemRef"
        class="group-item"
        name="分组"
        :value="getGroupName(feedGroup)"
        editable
        @save="onSaveGroup"
      >
        <MoGroupNameSelector @select="onSelectGroup"></MoGroupNameSelector>
      </MoFeedDetailInfoItem>
      <MoFeedDetailInfoItem
        v-for="item in feedInfo"
        :key="item.name"
        :name="item.name"
        :type="item.type"
        :value="item.value"
      ></MoFeedDetailInfoItem>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoFeedDetailInfoItem from '@/components/MoFeedDetailInfoItem.vue'
import MoGroupNameSelector from '@/components/MoGroupNameSelector.vue'
import { formatFullDateFriendly } from '@/plugin/datefmt'
import { getGroupName, getGroupId } from '@/plugin/feedGroupHelper'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

const FEED_FIELDS = [
  {
    name: '状态',
    key: function(feed) {
      let status = `${_.defaultTo(feed.status, '')} / ${_.defaultTo(feed.response_status, '')}`
      if (!_.isEmpty(feed.response_status_name)) {
        status = `${status} / ${feed.response_status_name}`
      }
      return status
    },
    type: 'status',
  },
  {
    name: '异常',
    key: 'warnings',
    process: function(value) {
      if (_.isEmpty(value)) {
        return '无'
      }
      return value
    },
  },
  {
    name: '主页',
    key: 'link',
    type: 'link',
  },
  {
    name: '简介',
    key: 'description',
  },
  {
    name: '作者',
    key: 'author',
  },
  {
    name: '供稿地址',
    key: 'url',
    type: 'link',
  },
  {
    name: '供稿格式',
    key: 'version',
  },
  {
    name: '未读故事',
    key: 'num_unread_storys',
    type: 'number',
  },
  {
    name: '故事总数',
    key: 'total_storys',
    type: 'number',
  },
  {
    name: '发布周期',
    key: 'dryness',
    process: function(value) {
      if (_.isNil(value)) {
        return '未知'
      }
      let numStorysPerMonth = 256 / Math.pow(2, (8 * value) / 1000) - 1
      let period = 31 / (numStorysPerMonth + 1)
      if (period >= 1) {
        return `约 ${period.toFixed(0)} 天`
      } else {
        return `小于 1 天`
      }
    },
  },
  {
    name: '干货程度',
    key: 'dryness',
    process: function(value) {
      if (_.isNil(value)) {
        return '未知'
      }
      return `${(value / 10).toFixed(1)}%`
    },
  },
  {
    name: '冻结级别',
    key: 'freeze_level',
    type: 'number',
  },
  {
    name: '使用代理',
    key: 'use_proxy',
    type: 'boolean',
  },
  {
    name: '最老故事发布时间',
    key: 'dt_first_story_published',
    type: 'datetime',
  },
  {
    name: '最新故事发布时间',
    key: 'dt_latest_story_published',
    type: 'datetime',
  },
  {
    name: '创建时间',
    key: 'dt_created',
    type: 'datetime',
  },
  {
    name: '更新时间',
    key: 'dt_updated',
    type: 'datetime',
  },
  {
    name: '检查时间',
    key: 'dt_checked',
    type: 'datetime',
  },
  {
    name: '同步时间',
    key: 'dt_synced',
    type: 'datetime',
  },
]

export default {
  components: { MoBackHeader, MoLayout, MoFeedDetailInfoItem, MoGroupNameSelector },
  data() {
    return {}
  },
  async mounted() {
    await feedStore.load({ feedId: this.feedId, detail: true })
    await rootStore.syncFeedLoadMushrooms()
  },
  computed: {
    feedId() {
      return this.$route.query.id
    },
    feed() {
      return feedStore.get(this.feedId)
    },
    feedTitle() {
      return _.isNil(this.feed) ? '' : this.feed.title
    },
    feedGroup() {
      return feedStore.groupOf(this.feed)
    },
    feedInfo() {
      let feed = this.feed
      if (_.isNil(feed)) {
        feed = { id: this.feedId, title: this.feedTitle }
      }
      let info = []
      FEED_FIELDS.forEach(field => {
        let item = {
          name: field.name,
          type: field.type,
        }
        if (_.isFunction(field.key)) {
          item.value = field.key(feed)
        } else {
          item.value = feed[field.key]
        }
        if (!_.isNil(field.process)) {
          item.value = field.process(item.value)
        }
        if (field.type === 'datetime') {
          item.value = formatFullDateFriendly(item.value)
        } else if (field.type === 'boolean') {
          item.value = item.value ? '是' : '否'
        }
        info.push(item)
      })
      return info
    },
  },
  methods: {
    getGroupName,
    async onSaveTitle({ value, done }) {
      try {
        await feedStore.setTitle({ feedId: this.feedId, title: value })
      } catch (ex) {
        this.$toast.error(`更新失败: ${ex.message}`)
      }
      done()
    },
    onSelectGroup(name) {
      let groupItemRef = this.$refs.groupItemRef
      if (!_.isNil(groupItemRef)) {
        groupItemRef.setEditValue(name)
      }
    },
    async onSaveGroup({ value, done }) {
      let group = getGroupId(value)
      if (!_.isEmpty(group) && group !== this.feedGroup) {
        try {
          await feedStore.setAllGroup({ feedIds: [this.feedId], group: group })
        } catch (ex) {
          this.$toast.error(`更新失败: ${ex.message}`)
        }
      }
      done()
    },
    deleteFeed() {
      this.$confirm(`删除订阅 “${this.feedTitle}” ？`, '提示', {
        type: 'warning',
      }).then(({ result }) => {
        if (result) {
          feedStore
            .delete({ feedId: this.feedId })
            .then(() => {
              this.$toast.success('删除成功')
              this.$router.go(-2)
            })
            .catch(error => {
              this.$toast.message('删除失败: ' + error.message)
            })
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-info {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  padding-bottom: 16 * @pr;
}

.title-item {
  padding-top: 20 * @pr;
}

.group-item {
  padding-top: 7 * @pr;
  padding-bottom: 7 * @pr;
}

.group-name-selector {
  margin-left: 80 * @pr;
}

.action-icon {
  display: inline-block;
  width: 22 * @pr;
}

.action-delete {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-left: 16 * @pr;
}
</style>