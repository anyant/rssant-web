<template>
  <div class="rssant-task-list">
    <el-table :data="taskList" stripe>
      <el-table-column prop="name" label="名称">
        <template slot-scope="scope">
          <router-link :to="{name: 'Task', params: {'taskId': scope.row.id}}">
            {{ scope.row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="dtu" label="更新时间">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['taskList'])
  }
}
</script>

<style>
</style>
