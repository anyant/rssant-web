<template>
  <div class="anyant-task-list">
    <el-table :data="taskList" stripe>
      <el-table-column prop="id" label="ID">
        <template slot-scope="scope">
          <router-link :to="{name: 'Task', params: {'taskId': scope.row.id}}">
            {{ scope.row.id }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name">
      </el-table-column>
      <el-table-column prop="dtu" label="Update Time">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    taskList: Array
  }
}
</script>

<style>

</style>
