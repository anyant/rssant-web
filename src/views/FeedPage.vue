<template>
  <Layout>
    <Header>
      <template v-slot:left>
        <NavTitle>{{ feed.title }}</NavTitle>
      </template>
      <mu-button flat mini class="goto-feed-detail" @click="gotoFeedDatail">
        <mu-icon value="details"></mu-icon>
        <span>详情</span>
      </mu-button>
      <mu-button flat mini class="set-feed-readed" @click="setFeedReaded">
        <mu-icon value="done_all"></mu-icon>
        <span>已读</span>
      </mu-button>
      <AddFeedButton></AddFeedButton>
    </Header>
    <StoryList></StoryList>
  </Layout>
</template>

<script>
import lodash from 'lodash'

import Layout from '@/components/Layout'
import Header from '@/components/Header'
import NavTitle from '@/components/NavTitle'
import StoryList from '@/components/StoryList'
import AddFeedButton from '@/components/AddFeedButton'

export default {
  components: { Layout, StoryList, Header, NavTitle, AddFeedButton },
  created() {
    this.$StoreAPI.feed.loadFeed({ feedId: this.feedId })
  },
  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    feed() {
      let feed = this.$StoreAPI.feed.getFeed({ feedId: this.feedId })
      if (lodash.isNil(feed)) {
        feed = { id: this.feedId }
      }
      if (lodash.isEmpty(feed.title)) {
        feed.title = 'Feed#' + this.feedId
      }
      return feed
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$StoreAPI.$emit('beforeRouteEnter')
    })
  },
  beforeRouteLeave(to, from, next) {
    this.$StoreAPI.$emit('beforeRouteLeave')
    next()
  },
  methods: {
    gotoFeedDatail() {
      this.$router.push(`/feed/${this.feedId}/detail`)
    },
    async setFeedReaded() {
      await this.$StoreAPI.feed.setFeedReaded({ feedId: this.feedId })
    }
  }
}
</script>

<style lang="less" scoped>
.set-feed-readed,
.goto-feed-detail {
  span {
    font-weight: 700;
  }
}
</style>
