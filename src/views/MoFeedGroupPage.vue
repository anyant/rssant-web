<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>{{ numUnreadText }}{{ name }}</template>
      <MoReadedButton @click="setAllReaded" class="action-readed"></MoReadedButton>
      <mu-button icon class="action-detail" @click="goFeedGroupDetail">
        <fa-icon size="18" icon="info-circle" />
      </mu-button>
    </MoBackHeader>
    <div class="list" ref="mainRef">
      <MoFeedVirtualItem
        v-for="item in virtualList"
        :key="item.id"
        :feed="item.feed"
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
  name: 'MoFeedGroupPage',
  components: {
    MoBackHeader,
    MoLayout,
    MoFeedVirtualItem,
    MoReadedButton,
  },
  data() {
    return {
      keyboard: Keyboard(),
    }
  },
  computed: {
    computedVid() {
      return `/group?name=${this.name}`
    },
    name() {
      return decodeURIComponent(this.$route.query.name)
    },
    group() {
      return feedStore.getGroupByName(this.name)
    },
    numUnreadText() {
      let num = feedStore.numUnreadOfGroup(this.group)
      return num > 0 ? `#${num}# ` : ''
    },
    feeds() {
      return feedStore.feedListOfGroup(this.group)
    },
    mushrooms() {
      return storyStore.mushroomsOfGroup(this.name)
    },
    virtualList() {
      let mushroomFeedIds = {}
      _.forEach(this.mushrooms, story => {
        mushroomFeedIds[story.feed.id] = true
      })
      let items = []
      _.forEach(this.mushrooms, story => {
        items.push({
          id: `${story.feed.id}:${story.offset}`,
          story: story,
        })
      })
      _.forEach(this.feeds, feed => {
        if (!mushroomFeedIds[feed.id]) {
          items.push({ feed: feed, id: feed.id })
        }
      })
      return items
    },
  },
  async mounted() {
    await rootStore.syncFeedLoadMushrooms()
    // when group rename, exit this page
    if (_.isEmpty(this.feeds)) {
      this.$router.back()
      return
    }
    this.restoreScroll()
    this.keyboard.setup()
    const groupName = this.name // keep groupName after this page destroyed
    storyStore.setNextStoryGetter(({ feedId, offset }) => {
      return this.getNextStoryInfo({ groupName, feedId, offset })
    })
  },
  destroyed() {
    this.keyboard.destroy()
  },
  savePageState() {
    this.saveScroll()
  },
  // https://forum.vuejs.org/t/in-component-guard-beforerouteleave-not-working-solved/4658/3
  beforeRouteUpdate(to, from, next) {
    this.saveScroll()
    next()
  },
  methods: {
    getNextStoryInfo({ groupName, feedId, offset }) {
      let mushrooms = storyStore.mushroomsOfGroup(groupName)
      let story = storyStore.nextMushroomOf({
        mushrooms: mushrooms,
        feedId: feedId,
        offset: offset,
      })
      return { story, showFeedTitle: true }
    },
    saveScroll() {
      if (this.$pageState.saveScrollTop({ el: this.$refs.mainRef })) {
        this.$pageState.commit()
      }
    },
    restoreScroll() {
      this.$pageState.restoreScrollTop({ el: this.$refs.mainRef })
    },
    setAllReaded() {
      let feedIds = this.feeds.map(x => x.id)
      feedStore.setAllReaded({ feedIds })
    },
    goFeedGroupDetail() {
      this.$router.push({
        path: '/group-detail',
        query: { name: this.name },
      })
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

.list .feed-item,
.list .feed-story-item {
  margin-top: 8 * @pr;
  cursor: pointer;
}
</style>