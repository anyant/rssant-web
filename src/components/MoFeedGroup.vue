<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        {{title}}
        <template v-if="showNumUnread">
          <span class="num-unread">{{ numUnreadFeeds }}</span>
          <span class="num-total">/ {{ feedList.length }}</span>
        </template>
        <template v-else>
          <span class="num-total-only">{{ feedList.length }}</span>
        </template>
      </template>
      <mu-button icon class="action-readed" @click="setAllReaded">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <keep-alive>
      <div class="feed-list">
        <MoFeedItem
          v-for="feed in feedList"
          :key="feed.id"
          :title="feed.title"
          :number="feed.num_unread_storys"
          :date="feed.dt_latest_story_published || feed.dt_created"
          :link="`/feed/${feed.id}`"
        ></MoFeedItem>
      </div>
    </keep-alive>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedItem from '@/components/MoFeedItem.vue'

export default {
  components: { MoBackHeader, MoLayout, MoFeedItem },
  props: {
    title: {
      type: String,
      required: true
    },
    group: {
      type: String,
      required: true
    },
    showNumUnread: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    feedList() {
      return this.$API.feed[this.group]
    },
    numUnreadFeeds() {
      let key = 'numUnread' + _.startCase(this.group)
      return this.$API.feed[key]
    }
  },
  mounted() {
    this.$API.feed.sync().then(() => {
      let scrollTop = this.$pageState.get('scrollTop')
      if (!_.isNil(scrollTop)) {
        window.scrollTo(0, scrollTop)
      }
    })
  },
  savePageState() {
    this.$pageState.set('scrollTop', window.scrollY)
    this.$pageState.commit()
  },
  methods: {
    setAllReaded() {
      let feedIds = this.feedList.map(x => x.id)
      this.$API.feed.setAllReaded({ feedIds })
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-readed {
  position: relative;
  right: -6 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.feed-item {
  margin-top: 8 * @pr;
}

.feed-list {
  padding-bottom: 8 * @pr;
}

.num-unread,
.num-total-only {
  margin-left: 8 * @pr;
  margin-right: 4 * @pr;
}

.num-total,
.num-total-only {
  color: @antTextGrey;
  font-weight: normal;
}
</style>
