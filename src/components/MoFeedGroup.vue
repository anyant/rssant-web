<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>{{title}}{{ numFeedsText }}</template>
      <mu-button icon class="action-readed" @click="setAllReaded">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="feed-list">
      <MoFeedItem
        v-for="feed in feedList"
        :key="feed.id"
        :title="feed.title"
        :number="feed.num_unread_storys"
        :date="feed.dt_updated"
        :link="`/feed/${feed.id}`"
      ></MoFeedItem>
    </div>
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
    vid: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    group: {
      type: String,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    pageState() {
      return this.$API.page.of(this.vid)
    },
    feedList() {
      return this.$API.feed[this.group]
    },
    numFeedsText() {
      let n = this.feedList.length
      if (n <= 0) {
        return ''
      } else {
        return ` (${n})`
      }
    }
  },
  mounted() {
    this.$API.feed.sync().then(() => {
      let scrollTop = this.pageState.get('scrollTop')
      if (!_.isNil(scrollTop)) {
        window.scrollTo(0, scrollTop)
      }
    })
  },
  methods: {
    beforeRouteLeave(to, from, next) {
      let scrollTop = window.scrollY
      if (scrollTop > 0) {
        this.pageState.set('scrollTop', scrollTop)
        this.pageState.commit()
      }
      next()
    },
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
</style>
