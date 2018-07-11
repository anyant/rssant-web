<template>
  <DefaultLayout>
    <FeedList v-loading="!isFeedListReady"></FeedList>
  </DefaultLayout>
</template>
<script>
import { DefaultLayout } from '@/layouts'
import { FeedList } from '@/components/Feed'

export default {
  components: { DefaultLayout, FeedList },
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
