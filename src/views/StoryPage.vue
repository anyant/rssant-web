<template>
  <div>
    <Layout>
      <Header>
        <template v-slot:left>
          <NavTitle>{{ story.title }}</NavTitle>
        </template>
        <AddFeedButton></AddFeedButton>
      </Header>
      <Story :story="story" v-loading="isLoading"></Story>
    </Layout>
  </div>
</template>

<script>
import lodash from 'lodash'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import NavTitle from '@/components/NavTitle'
import Story from '@/components/Story'
import AddFeedButton from '@/components/AddFeedButton'

export default {
  components: { Layout, Story, Header, NavTitle, AddFeedButton },
  data() {
    return { isLoading: true }
  },
  computed: {
    storyId() {
      return this.$route.params.storyId
    },
    story() {
      let story = this.$StoreAPI.story.getStory({ storyId: this.storyId })
      if (lodash.isNil(story)) {
        story = { id: this.storyId }
      }
      if (lodash.isEmpty(story.title)) {
        story.title = 'Story#' + this.storyId
      }
      return story
    }
  },
  async created() {
    window.scrollTo(0, 0)
    try {
      await this.$StoreAPI.story.loadStory({ storyId: this.storyId, detail: true })
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
</style>
