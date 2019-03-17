<template>
  <div class="story-list" v-loading="isLoading" data-mu-loading-overlay-color="rgba(0, 0, 0, 0)">
    <virtual-scroll-list
      ref="scroll-list"
      class="story-list-content"
      :tobottom="onLoadNext"
      :size="size"
      :remain="remain"
    >
      <div
        class="story"
        :key="story.id"
        v-for="story in storyList"
        :style="{opacity: story.is_readed ? 0.5: 1.0}"
        @click="onStoryClick(story)"
      >
        <span class="story-title">{{ story.title }}</span>
        <span class="story-time">{{ timeAgo(story.dt_updated) }}</span>
        <mu-button class="story-favorite" icon @click.stop="toggleFavorite(story)">
          <mu-icon
            :value="story.is_favorited?'star':'star_border'"
            :color="story.is_favorited?'#F39C12':'#999'"
          ></mu-icon>
        </mu-button>
      </div>
    </virtual-scroll-list>
  </div>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

export default {
  data() {
    return {
      isLoading: true,
      size: 54,
      remain: 6
    }
  },
  computed: {
    isLogined() {
      return this.$StoreAPI.user.isLogined()
    },
    storyList() {
      return this.$StoreAPI.story.getStoryList({ feedId: this.feedId })
    },
    feedId() {
      return this.$route.params.feedId
    }
  },
  async mounted() {
    if (this.storyList.length > 0) {
      this.isLoading = false
    }
    this.remain = this.$el.clientHeight / this.size
    try {
      // this.remain + 1 才能滚动到底触发 onLoadNext
      await this.$StoreAPI.story.loadInitStoryList({ feedId: this.feedId, size: Math.floor(this.remain) + 1 })
    } finally {
      this.isLoading = false
    }
    // fix scroll list not update
    this.$refs['scroll-list'].forceRender()
  },
  methods: {
    timeAgo(date) {
      if (lodash.isEmpty(date)) {
        return ''
      }
      return moment(date).fromNow()
    },
    onStoryClick(story) {
      this.$router.push(`/story/${story.id}`)
    },
    toggleFavorite(story) {
      let is_favorited = story.is_favorited
      // toggle
      story.is_favorited = !is_favorited
      this.$StoreAPI.story
        .setStoryFavorited({
          storyId: story.id,
          is_favorited: !is_favorited
        })
        .catch(() => {
          // rollback
          story.is_favorited = is_favorited
        })
    },
    async onLoadNext() {
      if (!this.$StoreAPI.story.hasNext({ feedId: this.feedId })) {
        return
      }
      this.isLoading = true
      try {
        this.$StoreAPI.story.loadNextStoryList({ feedId: this.feedId })
      } finally {
        setTimeout(() => {
          this.isLoading = false
        }, 200)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.story-list {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 720px;
  min-width: 600px;
  margin: 20px auto;
  overflow-y: auto;
}

.story {
  display: flex;
  align-items: center;
  padding: 4px 4px;
  margin: 0 16px;
  border-bottom: 1px solid rgba(9, 9, 9, 0.1);
  cursor: pointer;
}

.story:hover {
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #fff;
}

.story-title {
  display: inline-block;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-time {
  display: inline-block;
  color: gray;
}

.story-favorite {
  margin-left: 8px;
}
</style>
