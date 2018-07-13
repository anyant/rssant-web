<template>
  <div>
    <mu-list>
      <div :key="story.id" v-for="story in storyList">
        <mu-list-item>
          <div @click="handleStoryClick(story)">
            <mu-ripple>{{ story.title }} - {{ story.dtu }}</mu-ripple>
          </div>
        </mu-list-item>
        <mu-divider shallow-inset></mu-divider>
      </div>
    </mu-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['storyList'])
  },
  methods: {
    handleStoryClick(story) {
      this.$router.push(`/story/${story.id}`)
    }
  }
}
</script>

<style scoped>
</style>
