<template>
  <div class="feed-list">
    <div :key="index" v-for="(feed, index) in feedList">
      <mu-row class="feed">
        <mu-col class="feed-left">
          <FeedStatus :status="feed.status"></FeedStatus>
          <span class="feed-title" @click="handleFeedClick(feed.id)">{{ feed.title || feed.id }}</span>
        </mu-col>
        <mu-col span="3" class="feed-right">
          <span class="feed-time">{{ feed.dtu | moment("from") }}</span>
          <mu-button flat color="primary" @click="handleDelete(feed.id)">删除</mu-button>
        </mu-col>
      </mu-row>
      <div class="divider"></div>
    </div>
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
      this.$store.commit('setStoryList', [])
      this.$router.push(`/feed/${feedId}`)
    }
  }
}
</script>

<style scoped>
.feed-list {
  margin-top: 20px;
}

.feed {
  margin-left: 16px;
  margin-right: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(9, 9, 9, 0.1);
}

.feed-left,
.feed-right {
  display: flex;
  align-items: center;
}

.feed-right {
  justify-content: flex-end;
}

.feed-title {
  display: inline-block;
  line-height: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 2px;
  flex: 1;
  margin-left: 4px;
  cursor: pointer;
}

.feed-title:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.feed-time {
  display: inline-block;
  color: gray;
  margin-right: 4px;
}
</style>
