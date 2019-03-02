<template>
  <Layout>
    <Header>
      <template v-slot:left>
        <NavTitle :font-size="22">{{ feed.title }}</NavTitle>
      </template>
      <AddFeedButton></AddFeedButton>
    </Header>
    <FeedDetail :feed="feed"></FeedDetail>
  </Layout>
</template>

<script>
import * as lodash from 'lodash-es'

import Layout from '@/components/Layout'
import Header from '@/components/Header'
import NavTitle from '@/components/NavTitle'
import FeedDetail from '@/components/FeedDetail'
import AddFeedButton from '@/components/AddFeedButton'

export default {
  components: { Layout, Header, NavTitle, FeedDetail, AddFeedButton },
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
  }
}
</script>

<style scoped>
</style>
