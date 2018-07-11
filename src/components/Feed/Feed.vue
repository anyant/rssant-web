<template>
  <div>
    <mu-list>
      <mu-sub-header>{{ feed.name }} - {{ feed.dtu }}</mu-sub-header>
      <div :key="story.id" v-for="story in storyList">
        <mu-list-item>
          {{ story.title }} - {{ story.dtu }}
        </mu-list-item>
        <mu-divider></mu-divider>
      </div>
    </mu-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as lodash from 'lodash-es'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['storyList']),
    feed() {
      let feed = this.$store.getters.currentFeed
      return lodash.isNil(feed) ? {} : feed
    }
  }
}
</script>

<style>
</style>
