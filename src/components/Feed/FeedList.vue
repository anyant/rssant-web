<template>
  <div>
    <el-table :data="feedList">
      <el-table-column prop="status" label="Status" min-width="90px"></el-table-column>
      <el-table-column prop="feed.title" label="Title" min-width="160px"></el-table-column>
      <el-table-column prop="url" label="URL" min-width="160px"></el-table-column>
      <el-table-column prop="feed.description" label="Description" min-width="220px"></el-table-column>
      <el-table-column prop="dtu" label="Update Time" min-width="200px"></el-table-column>
      <el-table-column label="Delete" min-width="80px">
        <template slot-scope="scope">
          <mu-icon-button @click="handleDeleteFeed(scope.row.id)">
            <i class="fa fa-times"></i>
          </mu-icon-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    feedList: Array,
    delFeed: Function
  },
  data() {
    return {}
  },
  methods: {
    async handleDeleteFeed(feedId) {
      try {
        await this.delFeed(feedId)
      } catch (e) {
        this.$notify.error(e.message)
      }
    }
  }
}
</script>

<style>

</style>
