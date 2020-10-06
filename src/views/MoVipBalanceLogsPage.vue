<template>
  <MoLayout header class="vip">
    <MoBackHeader>
      <template v-slot:title>充值兑换记录</template>
    </MoBackHeader>
    <div class="main">
      <MoAntGreenButton @click="onExchange" :disabled="isExchangeDisabled">兑换</MoAntGreenButton>
    </div>
  </MoLayout>
</template>

<script>
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import MoAntGreenButton from '@/components/MoAntGreenButton'
export default {
  components: {
    MoLayout,
    MoBackHeader,
    MoAntGreenButton,
  },
  data() {
    return {
      inputText: null,
      errorText: null,
    }
  },
  computed: {
    isExchangeDisabled() {
      return !this.inputText
    },
  },
  methods: {
    onExchange() {},
  },
}
</script>

<style>
</style>