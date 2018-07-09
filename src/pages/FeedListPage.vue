<template>
  <HeaderLayout>
    <FeedList :feedList="feedList" :delFeed="delFeed"></FeedList>
  </HeaderLayout>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { HeaderLayout } from '@/layouts'
import { FeedList } from '@/components/Feed'

export default {
  components: { HeaderLayout, FeedList },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['feedList'])
  },
  methods: {
    ...mapActions(['fetchFeedList', 'delFeed'])
  },
  async afterLogin() {
    await this.fetchFeedList()
  }
}
</script>

<style>
</style>
