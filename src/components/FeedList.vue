<template>
  <div>
    <mu-list>
      <div :key="index" v-for="(feed, index) in feedList">
        <mu-list-item>
          <div class="feed">
            <FeedStatus :status="feed.status"></FeedStatus>
            <div class="feed-title" @click="handleFeedClick(feed.id)">
              <mu-ripple>
                {{ feed.title || feed.id }} - {{ feed.dtu }}
              </mu-ripple>
            </div>
            <mu-button flat color="primary" @click="handleDelete(feed.id)">删除</mu-button>
          </div>
        </mu-list-item>
        <mu-divider shallow-inset></mu-divider>
      </div>
    </mu-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import FeedStatus from '@/components/FeedStatus'

export default {
  components: { FeedStatus },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['feedList'])
  },
  methods: {
    ...mapActions(['deleteFeed']),
    async handleDelete(feedId) {
      await this.deleteFeed(feedId)
      this.$message('删除成功！')
    },
    handleFeedClick(feedId) {
      this.$router.push(`/feed/${feedId}`)
    }
  }
}
</script>

<style scoped>
.feed-title {
  display: inline-block;
  line-height: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 2px;
}
.feed-title:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
