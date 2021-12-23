<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>{{ title }}</template>
    </MoBackHeader>
    <div class="creation-info" v-if="creation">
      <MoFeedDetailInfoItem name="URL" :value="creation.url" />
      <MoFeedDetailInfoItem name="状态" :value="creation.status" />
      <MoFeedDetailInfoItem name="分组" :value="groupName" />
      <MoFeedDetailInfoItem
        v-if="feedLink"
        name="订阅"
        type="router-link"
        :link="feedLink"
        :value="feedTitle"
      />
      <MoFeedDetailInfoItem name="创建时间" :value="dateText" />
      <div class="message-title">
        <div class="message-title-line"></div>
        <span class="message-title-text">日志信息</span>
        <div class="message-title-line"></div>
      </div>
      <pre class="message">{{ message }}</pre>
    </div>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedDetailInfoItem from '@/components/MoFeedDetailInfoItem.vue'
import { formatFullDateFriendly } from '@/plugin/datefmt'
import { getGroupName } from '@/plugin/feedGroupHelper'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

export default {
  components: { MoBackHeader, MoLayout, MoFeedDetailInfoItem },
  data() {
    return {}
  },
  computed: {
    creationId() {
      return this.$route.query.id
    },
    creation() {
      return feedStore.getCreation(this.creationId)
    },
    title() {
      if (_.isNil(this.creation)) {
        return `#${this.creationId}`
      } else {
        return this.creation.url
      }
    },
    groupName() {
      if (_.isNil(this.creation) || _.isEmpty(this.creation.group)) {
        return '无'
      }
      return getGroupName(this.creation.group)
    },
    dateText() {
      return formatFullDateFriendly(this.creation && this.creation.dt_created)
    },
    feedId() {
      if (_.isNil(this.creation) || _.isEmpty(this.creation.feed_id)) {
        return null
      }
      return this.creation.feed_id
    },
    feedLink() {
      if (_.isNil(this.feedId)) {
        return null
      }
      return `/feed?id=${this.feedId}`
    },
    feedTitle() {
      if (_.isNil(this.feedId)) {
        return null
      }
      let feed = feedStore.get(this.feedId)
      if (_.isNil(feed) || _.isEmpty(feed.title)) {
        return this.feedLink
      } else {
        return feed.title
      }
    },
    message() {
      if (_.isNil(this.creation)) {
        return ''
      }
      let message = _.defaultTo(this.creation.message, '')
      return message
    },
  },
  mounted() {
    feedStore.loadCreation({ creationId: this.creationId, detail: true })
    rootStore.syncFeedLoadMushrooms()
    window.scrollTo(0, 0)
  },
  methods: {},
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.creation-info {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  padding-bottom: 16 * @pr;
}

.message {
  margin-top: 13 * @pr;
  margin-bottom: 13 * @pr;
}

.message-title {
  margin-top: 13 * @pr;
  display: flex;
  align-items: center;
}

.message-title-text {
  padding-left: 8 * @pr;
  padding-right: 8 * @pr;
}

.message-title-line {
  flex: 1;
  height: 0;
  border-bottom: 1px solid @antLineGrey;
}
</style>
