<template>
  <Layout>
    <Header>
      <template slot="left">
        <Logo></Logo>
      </template>
      <mu-button flat @click="loginByTest">测试账号登录</mu-button>
      <AddFeedButton></AddFeedButton>
    </Header>
    <AddFeedDialog></AddFeedDialog>
    <FeedList v-loading="!isFeedListReady"></FeedList>
    <div class="not-login" v-if="(!isLogin) && (!loginLoading)">
      <div>你还没有登录哦~</div>
    </div>
  </Layout>
</template>
<script>
import Layout from '@/layouts/Layout'
import Header from '@/components/Header'
import AddFeedDialog from '@/components/AddFeedDialog'
import AddFeedButton from '@/components/AddFeedButton'
import Logo from '@/components/Logo'
import FeedList from '@/components/FeedList'
import { mapGetters } from 'vuex'

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
  computed: {
    ...mapGetters(['isLogin', 'loginLoading', 'feedList'])
  },
  async created() {
    if (this.feedList.length <= 0) {
      try {
        await this.$store.dispatch('fetchFeedList')
      } finally {
        this.isFeedListReady = true
      }
    } else {
      this.isFeedListReady = true
    }
  },
  methods: {
    async loginByTest() {
      location.assign(`/api/login/test?state=/`)
    }
  }
}
</script>

<style lang="less" scoped>
.not-login {
  text-align: center;
  margin-top: 60px;
  font-size: 24px;
}
</style>

