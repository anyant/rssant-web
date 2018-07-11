<template>
  <div>
    <mu-list>
      <div :key="index" v-for="(feed, index) in feedList">
        <mu-list-item>
          <div>
            {{feed.status}} - {{ feed.name }} - {{ feed.url }} - {{ feed.dtu }}
            <mu-button flat color="primary" @click="handleDelete(feed.id)">删除</mu-button>
          </div>
        </mu-list-item>
        <mu-divider shallow-inset></mu-divider>
      </div>
    </mu-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['feedList'])
  },
  methods: {
    ...mapActions(['deleteFeed']),
    async handleDelete(feedId) {
      await this.deleteFeed(feedId)
      this.$message('删除成功！')
    }
  }
}
</script>

<style scoped>
</style>
