<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>{{ numUnreadText }}品读</template>
      <MoReadedButton @click="setAllReaded" class="action-readed"></MoReadedButton>
      <mu-button icon class="action-detail" @click="goMushroomDetail">
        <fa-icon size="18" icon="info-circle" />
      </mu-button>
    </MoBackHeader>
    <div class="list" ref="mainRef">
      <MoFeedVirtualItem
        v-for="item in virtualList"
        :key="item.id"
        :story="item.story"
        :keyboard="keyboard"
      ></MoFeedVirtualItem>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedVirtualItem from '@/components/MoFeedVirtualItem'
import MoReadedButton from '@/components/MoReadedButton'
import Keyboard from '@/plugin/keyboard'
import { storyStore } from '@/store/story'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

export default {
  name: 'MoMushroomPage',
  components: {
    MoBackHeader,
    MoLayout,
    MoFeedVirtualItem,
    MoReadedButton,
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
      return storyStore.mushroomsOfHome
    },
    numUnreadMushrooms() {
      return storyStore.numUnreadOf(this.mushrooms)
    },
    numUnreadText() {
      let num = this.numUnreadMushrooms
      return num > 0 ? `#${num}# ` : ''
    },
    virtualList() {
      return this.mushrooms.map(story => {
        return { story: story, id: `${story.feed.id}:${story.offset}` }
      })
    },
  },
  async mounted() {
    await rootStore.syncFeedLoadMushrooms()
    this.restoreScroll()
    this.keyboard.setup()
  },
  destroyed() {
    this.keyboard.destroy()
  },
  activated() {
    this.restoreScroll()
    this.keyboard.setup()
    storyStore.setNextStoryGetter(this.getNextStoryInfo.bind(this))
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
    getNextStoryInfo({ feedId, offset }) {
      let story = storyStore.nextMushroomOf({
        mushrooms: this.mushrooms,
        feedId: feedId,
        offset: offset,
      })
      return { story, showFeedTitle: true }
    },
    restoreScroll() {
      this.$pageState.restoreScrollTop({ el: this.$refs.mainRef })
    },
    isReaded(story) {
      return storyStore.isReaded(story)
    },
    getFeedTitle(feedId) {
      return feedStore.get(feedId).title
    },
    setAllReaded() {
      let feedIds = {}
      this.mushrooms.forEach(story => {
        feedIds[story.feed.id] = true
      })
      feedStore.setAllReaded({ feedIds: _.keys(feedIds) })
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