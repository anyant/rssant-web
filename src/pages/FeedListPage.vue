<template>
  <DefaultLayout>
    <FeedList :feedList="feedList" :delFeed="delFeed"></FeedList>
  </DefaultLayout>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { DefaultLayout } from '@/layouts'
import { FeedList } from '@/components/Feed'

export default {
  components: { DefaultLayout, FeedList },
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
