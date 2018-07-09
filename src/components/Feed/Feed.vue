<template>
  <div>
    <el-table :data="feedList">
      <el-table-column prop="status" label="Status"></el-table-column>
      <el-table-column prop="title" label="Title"></el-table-column>
      <el-table-column prop="description" label="Description"></el-table-column>
      <el-table-column prop="dtu" label="Update Time"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    feedList: Array
  },
  data() {
    return {}
  }
}
</script>

<style>

</style>
