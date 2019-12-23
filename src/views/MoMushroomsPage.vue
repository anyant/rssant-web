<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        蘑菇
        <span class="num-unread">{{ numUnreadMushrooms }}</span>
        <span class="num-total">/ {{ mushrooms.length }}</span>
      </template>
      <mu-button icon class="action-readed" @click="setAllReaded">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <keep-alive>
      <div class="feed-story-list">
        <MoFeedStoryItem
          v-for="story in mushrooms"
          :key="`${story.feed.id}:${story.offset}`"
          :feedId="story.feed.id"
          :offset="story.offset"
          :feedTitle="getFeedTitle(story.feed.id)"
          :storyTitle="story.title"
          :storyDate="story.dt_published"
          :isReaded="isReaded(story)"
        ></MoFeedStoryItem>
      </div>
    </keep-alive>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'

export default {
  components: { MoBackHeader, MoLayout, MoFeedStoryItem },
  props: {
    vid: {
      type: String,
      default: '/mushrooms'
    }
  },
  data() {
    return {}
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms().then(() => {
      let scrollTop = this.$pageState.get('scrollTop')
      if (!_.isNil(scrollTop)) {
        window.scrollTo(0, scrollTop)
      }
    })
  },
  computed: {
    mushrooms() {
      return this.$API.story.mushrooms
    },
    numUnreadMushrooms() {
      return this.$API.story.numUnreadMushrooms
    }
  },
  methods: {
    getFeedTitle(feedId) {
      return this.$API.feed.get(feedId).title
    },
    isReaded(story) {
      return this.$API.story.isReaded(story)
    },
    setAllReaded() {
      let feedIds = new Set()
      this.mushrooms.forEach(story => {
        if (!this.isReaded(story)) {
          feedIds.add(story.feed.id)
        }
      })
      feedIds = Array.from(feedIds)
      this.$API.feed.setAllReaded({ feedIds })
    }
  },
  savePageState() {
    this.$pageState.set('scrollTop', window.scrollY)
    this.$pageState.commit()
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-readed {
  position: relative;
  right: -6 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.feed-item,
.feed-story-item {
  position: relative;
  margin-top: 8 * @pr;
}

.feed-story-list {
  padding-bottom: 8 * @pr;
}

.num-unread {
  margin-left: 8 * @pr;
  margin-right: 4 * @pr;
}

.num-total {
  color: @antTextGrey;
  font-weight: normal;
}
</style>
