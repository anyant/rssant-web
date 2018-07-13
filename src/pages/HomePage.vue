<template>
  <Layout>
    <Header>
      <template slot="left">
        <Logo></Logo>
      </template>
      <AddFeedButton></AddFeedButton>
    </Header>
    <AddFeedDialog></AddFeedDialog>
    <FeedList v-loading="!isFeedListReady"></FeedList>
  </Layout>
</template>
<script>
import Layout from '@/layouts/Layout'
import Header from '@/components/Header'
import AddFeedDialog from '@/components/AddFeedDialog'
import AddFeedButton from '@/components/AddFeedButton'
import Logo from '@/components/Logo'
import FeedList from '@/components/FeedList'

export default {
  components: {
    Layout,
    Header,
    Logo,
    AddFeedButton,
    AddFeedDialog,
    FeedList
  },
  data() {
    return {
      isFeedListReady: false
    }
  },
  async created() {
    try {
      await this.$store.dispatch('fetchFeedList')
    } finally {
      this.isFeedListReady = true
    }
  }
}
</script>

<style>
</style>
