<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>{{ title }}</template>
    </MoBackHeader>
    <div class="creation-info" v-if="creation">
      <MoFeedDetailInfoItem name="URL" :value="creation.url" />
      <MoFeedDetailInfoItem name="状态" :value="statusText" />
      <MoFeedDetailInfoItem name="分组" :value="groupName" />
      <MoFeedDetailInfoItem
        v-if="feedLink"
        name="订阅"
        type="router-link"
        :link="feedLink"
        :value="feedTitle"
      />
      <MoFeedDetailInfoItem name="创建时间" :value="dateText" />
      <div class="creation-error" v-if="showErrorMessage">
        <fa-icon class="creation-error-icon" icon="exclamation-circle" :size="14" />
        <div class="creation-error-text">{{ errorMessage }}</div>
      </div>
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

const STATUS_TEXT_MAP = {
  pending: '等待查找',
  updating: '正在查找',
  ready: '已添加',
  error: '添加失败',
}

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
    statusText() {
      if (_.isNil(this.creation)) {
        return ''
      }
      return _.defaultTo(STATUS_TEXT_MAP[this.creation.status], this.creation.status)
    },
    errorMessage() {
      if (_.isNil(this.creation)) {
        return ''
      }
      return _.defaultTo(this.creation.error_message, '')
    },
    showErrorMessage() {
      return (
        !_.isNil(this.creation) &&
        this.creation.status === 'error' &&
        !_.isEmpty(this.errorMessage)
      )
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

.creation-error {
  display: flex;
  align-items: flex-start;
  margin-top: 16 * @pr;
  padding: 12 * @pr 16 * @pr;
  background: mix(@antRed, @antBackWhite, 8%);
  border-radius: 4 * @pr;
}

.creation-error-icon {
  flex-shrink: 0;
  margin-top: 3 * @pr;
  margin-right: 8 * @pr;
  color: @antRed;
}

.creation-error-text {
  font-size: 14 * @pr;
  line-height: 24 * @pr;
  color: @antTextSemi;
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
