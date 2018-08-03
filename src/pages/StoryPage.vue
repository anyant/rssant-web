<template>
  <div>
    <Layout>
      <Header>
        <template slot="left">
          <GoBack></GoBack>
          <HeaderTitle>{{ storyTitle }}</HeaderTitle>
        </template>
      </Header>
      <Story></Story>
    </Layout>
  </div>
</template>

<script>
import * as lodash from 'lodash-es'
import Layout from '@/layouts/Layout'
import Header from '@/components/Header'
import GoBack from '@/components/GoBack'
import Story from '@/components/Story'
import HeaderTitle from '@/components/HeaderTitle'

export default {
  components: { Layout, Story, Header, GoBack, HeaderTitle },
  computed: {
    storyId() {
      return this.$route.params.storyId
    },
    storyTitle() {
      let story = this.$store.getters.currentStory
      return lodash.isNil(story) ? this.storyId : story.title
    }
  },
  async created() {
    window.scrollTo(0, 0)
    await this.$store.dispatch('setCurrentStory', this.storyId)
  }
}
</script>

<style scoped>
</style>
