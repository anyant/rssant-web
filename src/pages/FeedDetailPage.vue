<template>
  <Layout>
    <Header>
      <template slot="left">
        <GoBack></GoBack>
        <HeaderTitle :font-size="22">{{ feedTitle }}</HeaderTitle>
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
import HeaderTitle from '@/components/HeaderTitle'

export default {
  components: { Layout, Header, GoBack, FeedDetail, HeaderTitle },

  async created() {
    this.$store.dispatch('setCurrentFeed', this.feedId)
    this.$store.dispatch('fetchStoryList', this.feedId)
  },

  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    feedTitle() {
      return this.$store.getters.currentFeedTitle
    }
  }
}
</script>

<style scoped>
</style>
