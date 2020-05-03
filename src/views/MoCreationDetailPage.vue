<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>{{ title }}</template>
    </MoBackHeader>
    <div class="creation-info" v-if="creation">
      <div class="item">
        <span class="item-name">URL</span>
        <span class="item-value">{{ creation.url }}</span>
      </div>
      <div class="item">
        <span class="item-name">状态</span>
        <span class="item-value">{{ creation.status }}</span>
      </div>
      <div class="item" v-if="feedLink">
        <span class="item-name">订阅</span>
        <router-link class="item-link" :to="feedLink">
          {{ feedTitle }}
          <i class="fa fa-external-link" aria-hidden="true"></i>
        </router-link>
      </div>
      <div class="item">
        <span class="item-name">创建时间</span>
        <span class="item-value">{{ dateText }}</span>
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
import { formatFullDate } from '@/plugin/datefmt'

export default {
  components: { MoBackHeader, MoLayout },
  data() {
    return {}
  },
  computed: {
    creationId() {
      return this.$route.params.creationId
    },
    creation() {
      return this.$API.feed.getCreation(this.creationId)
    },
    title() {
      if (_.isNil(this.creation)) {
        return `#${this.creationId}`
      } else {
        return this.creation.url
      }
    },
    dateText() {
      return formatFullDate(this.creation && this.creation.dt_created)
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
      return `/feed/${this.feedId}`
    },
    feedTitle() {
      if (_.isNil(this.feedId)) {
        return null
      }
      let feed = this.$API.feed.get(this.feedId)
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
    this.$API.feed.loadCreation({ creationId: this.creationId, detail: true }).then(() => {
      this.$API.syncFeedLoadMushrooms()
    })
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

.item {
  display: flex;
  align-items: center;
  padding-top: 13 * @pr;
}

.item-name {
  flex-shrink: 0;
  display: inline-block;
  text-align: right;
  width: 64 * @pr;
  margin-right: 24 * @pr;
  font-size: 15 * @pr;
}

.item-value,
.item-link {
  font-size: 15 * @pr;
  max-height: 4 * 22 * @pr;
  overflow: hidden;
  text-overflow: clip;

  .fa {
    position: relative;
    left: 1 * @pr;
    top: 1 * @pr;
  }
}

.item-link {
  color: @antBlue;
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
