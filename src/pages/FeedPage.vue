<template>
  <div>
    <DefaultLayout>
      <Feed></Feed>
    </DefaultLayout>
  </div>
</template>

<script>
import { DefaultLayout } from '@/layouts'
import { Feed } from '@/components/Feed'
export default {
  components: { DefaultLayout, Feed },
  async created() {
    let feedId = this.$route.params.feedId
    this.$store.dispatch('setCurrentFeed', feedId)
    this.$store.dispatch('fetchStoryList', feedId)
  }
}
</script>

<style scoped>
</style>
