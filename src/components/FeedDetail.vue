<template>
  <div>
    <mu-list v-if="feed" class="badge-list-wrap">
      <mu-list-item>
        名称：{{feed.name}}
      </mu-list-item>
      <mu-list-item>
        状态：
        <FeedStatus :status="feed.status"></FeedStatus>
      </mu-list-item>
      <mu-list-item>
        URL：
        <a :href="feed.url" target="_blank">{{feed.url}}</a>
      </mu-list-item>
      <mu-list-item>
        版本：{{feed.version}}
      </mu-list-item>
      <mu-list-item>
        最后更新时间：{{feed.dtu}}
      </mu-list-item>
    </mu-list>
  </div>
</template>

<script>
import FeedStatus from '@/components/FeedStatus'

export default {
  components: { FeedStatus },
  computed: {
    feed() {
      return this.$store.getters.currentFeed
    }
  }
}
</script>

<style scoped>
</style>
