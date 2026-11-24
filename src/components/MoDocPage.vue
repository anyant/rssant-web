<template>
  <MoLayout header solo>
    <MoBackHeader border>
      <template v-slot:title>{{ title }}</template>
    </MoBackHeader>
    <div class="main">
      <div class="markdown-body legal-doc"><slot></slot></div>
    </div>
  </MoLayout>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'

export default {
  name: 'MoDocPage',
  components: { MoLayout, MoBackHeader },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding: 16 * @pr;
  padding-bottom: 32 * @pr;
}
</style>
