<template>
  <DefaultLayout>
    <FeedList v-loading="!isFeedListReady"></FeedList>
  </DefaultLayout>
</template>
<script>
import { DefaultLayout } from '@/layouts'
import { FeedList } from '@/components/Feed'
import { mapGetters } from 'vuex'

export default {
  components: { DefaultLayout, FeedList },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['isFeedListReady'])
  },
  async created() {
    await this.$store.dispatch('fetchFeedList')
  }
}
</script>

<style>
</style>
