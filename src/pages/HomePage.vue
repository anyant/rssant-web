<template>
  <Layout>
    <Header>
      <template v-slot:left>
        <Logo></Logo>
      </template>
      <AddFeedButton></AddFeedButton>
    </Header>
    <FeedList></FeedList>
    <div class="not-login" v-if="!isLogined">
      <div>你还没有登录哦~</div>
    </div>
  </Layout>
</template>
<script>
import Layout from '@/layouts/Layout'
import Header from '@/components/Header'
import AddFeedButton from '@/components/AddFeedButton'
import Logo from '@/components/Logo'
import FeedList from '@/components/FeedList'

export default {
  components: {
    Layout,
    Header,
    Logo,
    AddFeedButton,
    FeedList
  },
  data() {
    return {}
  },
  computed: {
    isLogined() {
      return this.$StoreAPI.user.isLogined()
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

