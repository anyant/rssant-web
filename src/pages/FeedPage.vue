<template>
  <Layout>
    <Header>
      <template slot="left">
        <GoBack></GoBack>
        <HeaderTitle :font-size="22">{{ feedName }}</HeaderTitle>
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
import HeaderTitle from '@/components/HeaderTitle'
import StoryList from '@/components/StoryList'

export default {
  components: { Layout, StoryList, Header, GoBack, HeaderTitle },

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
