<template>
  <Layout>
    <Header>
      <template slot="left">
        <GoBack></GoBack>
        <HeaderTitle :font-size="22">{{ feedTitle }}</HeaderTitle>
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
import Layout from '@/layouts/Layout'
import Header from '@/components/Header'
import GoBack from '@/components/GoBack'
import HeaderTitle from '@/components/HeaderTitle'
import StoryList from '@/components/StoryList'

export default {
  components: { Layout, StoryList, Header, GoBack, HeaderTitle },

  async created() {
    this.$store.dispatch('setCurrentFeed', this.feedId)
  },
  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    feedTitle() {
      return this.$store.getters.currentFeedTitle
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
