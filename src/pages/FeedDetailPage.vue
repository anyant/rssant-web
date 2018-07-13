<template>
  <Layout>
    <Header>
      <template slot="left">
        <GoBack></GoBack>
        <div class="feed-name">{{ feedName }}</div>
      </template>
    </Header>
    <FeedDetail></FeedDetail>
  </Layout>
</template>

<script>
import Layout from '@/layouts/Layout'
import Header from '@/components/Header'
import GoBack from '@/components/GoBack'
import FeedDetail from '@/components/FeedDetail'

export default {
  components: { Layout, Header, GoBack, FeedDetail },

  async created() {
    this.$store.dispatch('setCurrentFeed', this.feedId)
    this.$store.dispatch('fetchStoryList', this.feedId)
  },

  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    feedName() {
      return this.$store.getters.currentFeedName
    }
  }
}
</script>

<style scoped>
.feed-name {
  margin-left: 8px;
  display: inline-block;
  font-size: 22px;
}
</style>
