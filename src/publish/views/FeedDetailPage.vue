<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>{{ feedTitle }}</template>
    </MoBackHeader>
    <div class="feed-info">
      <MoFeedDetailInfoItem v-for="item in feedInfo" :key="item.name" :name="item.name" :type="item.type"
        :value="item.value"></MoFeedDetailInfoItem>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader.vue'
import { formatFullDateFriendly } from '@/plugin/datefmt'
import { publishFeedStore } from '@/publish/store/feed'
import MoFeedDetailInfoItem from '@/components/MoFeedDetailInfoItem.vue'

const FEED_FIELDS = [
  {
    name: '标题',
    key: 'title',
  },
  {
    name: '状态',
    key: function (feed) {
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
    process: function (value) {
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
    name: '故事总数',
    key: 'total_storys',
    type: 'number',
  },
  {
    name: '发布周期',
    key: 'dryness',
    process: function (value) {
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
  components: { MoBackHeader, MoLayout, MoFeedDetailInfoItem },
  data() {
    return {}
  },
  async mounted() {
    await publishFeedStore.doGet({ id: this.feedId, detail: true })
  },
  computed: {
    feedId() {
      return this.$route.query.id
    },
    feed() {
      return publishFeedStore.get(this.feedId)
    },
    feedTitle() {
      return _.isNil(this.feed) ? '' : this.feed.title
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
</style>