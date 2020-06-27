<template>
  <MoLayout grey header board>
    <MoHome></MoHome>
    <template v-slot:board>
      <router-view />
    </template>
  </MoLayout>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import MoHome from '@/components/MoHome'

export default {
  components: { MoLayout, MoHome },
}
</script>

<style>
</style>