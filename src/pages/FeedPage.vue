<template>
  <Layout>
    <Header>
      <template v-slot:left>
        <NavTitle :font-size="22">{{ feed.title }}</NavTitle>
      </template>
      <mu-button flat mini class="goto-feed-detail" @click="gotoFeedDatail">
        <mu-icon value="details"></mu-icon>
        <span>供稿详情</span>
      </mu-button>
      <AddFeedButton></AddFeedButton>
    </Header>
    <StoryList></StoryList>
  </Layout>
</template>

<script>
import * as lodash from 'lodash-es'

import Layout from '@/layouts/Layout'
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
  methods: {
    gotoFeedDatail() {
      this.$router.push(`/feed/${this.feedId}/detail`)
    }
  }
}
</script>

<style lang="less" scoped>
.goto-feed-detail {
  span {
    font-weight: 700;
  }
}
</style>
