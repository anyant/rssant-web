<template>
  <Layout>
    <Header>
      <template v-slot:left>
        <GoBack></GoBack>
        <HeaderTitle>任务列表</HeaderTitle>
      </template>
    </Header>
    <TaskList></TaskList>
  </Layout>
</template>
<script>
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import GoBack from '@/components/GoBack'
import TaskList from '@/components/TaskList'
import HeaderTitle from '@/components/HeaderTitle'

export default {
  components: { Layout, Header, GoBack, TaskList, HeaderTitle },
  created() {
    this.$store.dispatch('fetchTaskList')
  }
}
</script>

<style>
</style>
