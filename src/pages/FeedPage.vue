<template>
  <Layout>
    <Header>
      <template slot="left">
        <GoBack></GoBack>
        <div class="feed-name">{{ feedName }}</div>
      </template>
      <mu-button flat mini class="goto-feed-detail" @click="gotoFeedDatail">
        <mu-icon value="details"></mu-icon>
        <span>供稿详情</span>
      </mu-button>
    </Header>
    <StoryList></StoryList>
  </Layout>
</template>

<script>
import * as lodash from 'lodash-es'
import Layout from '@/layouts/Layout'
import Header from '@/components/Header'
import GoBack from '@/components/GoBack'
import StoryList from '@/components/StoryList'

export default {
  components: { Layout, StoryList, Header, GoBack },

  async created() {
    this.$store.dispatch('setCurrentFeed', this.feedId)
    this.$store.dispatch('fetchStoryList', this.feedId)
  },
  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    feedName() {
      let feed = this.$store.getters.currentFeed
      return lodash.isNil(feed) ? this.feedId : feed.name
    }
  }
}
</script>

<style lang="less" scoped>
.feed-name {
  margin-left: 8px;
  display: inline-block;
  font-size: 22px;
}
.goto-feed-detail {
  span {
    font-weight: 700;
  }
}
</style>
