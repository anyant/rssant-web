<template>
  <div v-if="feed">
    <mu-list class="badge-list-wrap">
      <mu-list-item>
        名称：{{feed.title}}
      </mu-list-item>
      <mu-list-item>
        状态：
        <FeedStatus :status="feed.status"></FeedStatus>
      </mu-list-item>
      <mu-list-item>
        主页：
        <a :href="feed.link" target="_blank">{{feed.link}}</a>
      </mu-list-item>
      <mu-list-item>
        作者：{{feed.author}}
      </mu-list-item>
      <mu-list-item>
        简介：{{feed.description}}
      </mu-list-item>
      <mu-list-item>
        供稿地址：
        <a :href="feed.url" target="_blank">{{feed.url}}</a>
      </mu-list-item>
      <mu-list-item>
        供稿格式：{{feed.version}}
      </mu-list-item>
      <mu-list-item>
        更新时间：{{ feed.dt_updated | moment('YYYY-MM-DD HH:mm') }} 约 {{ feed.dt_updated | moment('from') }}
      </mu-list-item>
    </mu-list>
    <pre>{{ feed.data }}</pre>
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
