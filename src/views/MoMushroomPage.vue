<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>{{ numUnreadText }}品读</template>
      <mu-button icon class="action-readed" @click="setAllReaded">
        <fa-icon icon="check" />
      </mu-button>
      <mu-button icon class="action-detail" @click="goMushroomDetail">
        <fa-icon size="18" icon="info-circle" />
      </mu-button>
    </MoBackHeader>
    <div class="list" ref="mainRef">
      <MoFeedStoryItem
        v-for="story in mushrooms"
        :key="`${story.feed.id}:${story.offset}`"
        :feedId="story.feed.id"
        :offset="story.offset"
        :feedTitle="getFeedTitle(story.feed.id)"
        :isReaded="isReaded(story)"
        :storyTitle="story.title"
        :storyDate="story.dt_published"
        :storyLink="story.link"
        :isCtrlKeyHold="keyboard.isCtrlKeyHold"
        source="mushroom"
      ></MoFeedStoryItem>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedStoryItem from '@/components/MoFeedStoryItem'
import Keyboard from '@/plugin/keyboard'

export default {
  name: 'MoMushroomPage',
  components: {
    MoBackHeader,
    MoLayout,
    MoFeedStoryItem,
  },
  props: {
    vid: {
      type: String,
      default: '/mushroom',
    },
  },
  data() {
    return {
      keyboard: Keyboard(),
    }
  },
  computed: {
    mushrooms() {
      return this.$API.story.mushrooms
    },
    numUnreadMushrooms() {
      return this.$API.story.numUnreadMushrooms
    },
    numUnreadText() {
      let num = this.numUnreadMushrooms
      return num > 0 ? `#${num}# ` : ''
    },
  },
  async mounted() {
    await this.$API.syncFeedLoadMushrooms()
    this.restoreScroll()
    this.keyboard.setup()
  },
  destroyed() {
    this.keyboard.destroy()
  },
  activated() {
    this.restoreScroll()
    this.keyboard.setup()
  },
  deactivated() {
    this.keyboard.destroy()
  },
  savePageState() {
    if (this.$pageState.saveScrollTop({ el: this.$refs.mainRef })) {
      this.$pageState.commit()
    }
  },
  methods: {
    restoreScroll() {
      this.$pageState.restoreScrollTop({ el: this.$refs.mainRef })
    },
    isReaded(story) {
      return this.$API.story.isReaded(story)
    },
    getFeedTitle(feedId) {
      return this.$API.feed.get(feedId).title
    },
    setAllReaded() {
      let feedIds = {}
      this.mushrooms.forEach(story => {
        feedIds[story.feed.id] = true
      })
      this.$API.feed.setAllReaded({ feedIds: _.keys(feedIds) })
    },
    goMushroomDetail() {
      this.$router.push('/mushroom-detail')
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-readed,
.action-detail {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-left: 16 * @pr;
}

.action-detail {
  position: relative;
  right: -4 * @pr;
  color: lighten(@antTextSemi, 5%);
}

.list {
  padding-bottom: 8 * @pr;
}

.list .feed-story-item {
  margin-top: 8 * @pr;
  cursor: pointer;
}
</style>