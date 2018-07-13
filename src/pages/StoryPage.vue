<template>
  <div>
    <Layout>
      <Header>
        <template slot="left">
          <GoBack></GoBack>
          <div class="title">{{ storyTitle }}</div>
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

export default {
  components: { Layout, Story, Header, GoBack },
  computed: {
    storyId() {
      return this.$route.params.storyId
    },
    storyTitle() {
      let story = this.$store.getters.currentStory
      return lodash.isNil(story) ? this.storyId : story.title
    }
  },
  created() {
    this.$store.dispatch('setCurrentStory', this.storyId)
  }
}
</script>

<style scoped>
.title {
  margin-left: 8px;
  display: inline-block;
  font-size: 20px;
  max-width: 20em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
