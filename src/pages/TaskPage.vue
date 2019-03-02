<template>
  <Layout>
    <Header>
      <template v-slot:left>
        <GoBack></GoBack>
        <HeaderTitle>{{currentTaskName}}</HeaderTitle>
      </template>
    </Header>
    <Task></Task>
  </Layout>
</template>

<script>
import Layout from '@/layouts/Layout'
import Header from '@/components/Header'
import HeaderTitle from '@/components/HeaderTitle'
import GoBack from '@/components/GoBack'
import Task from '@/components/Task'
import * as lodash from 'lodash-es'
import { mapGetters } from 'vuex'

export default {
  components: {
    Layout,
    Header,
    HeaderTitle,
    GoBack,
    Task
  },
  computed: {
    ...mapGetters(['currentTask']),
    taskId() {
      return this.$route.params.taskId
    },
    currentTaskName() {
      let task = this.currentTask
      if (lodash.isNil(task)) {
        return this.taskId
      } else {
        return task.name
      }
    }
  },
  created() {
    this.$store.dispatch('setCurrentTask', this.taskId)
  }
}
</script>

<style>
</style>
