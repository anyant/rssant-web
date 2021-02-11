<template>
  <mu-dialog
    class="dark-mode-dialog"
    title="夜间模式"
    :overlay-close="false"
    :open="open"
    v-on:update:open="onUpdateOpen"
  >
    <template v-if="isSupported">
      <div class="dark-mode-option">
        <mu-radio value="auto" v-model="value" label="跟随系统" :ripple="false"></mu-radio>
      </div>
      <div class="dark-mode-option">
        <mu-radio value="enable" v-model="value" label="开启" :ripple="false"></mu-radio>
      </div>
      <div class="dark-mode-option">
        <mu-radio value="disable" v-model="value" label="关闭" :ripple="false"></mu-radio>
      </div>
    </template>
    <template v-else>
      <div>当前浏览器不支持夜间模式，可以尝试用 Chrome，Safari，火狐，或微软Edge 打开蚁阅。</div>
    </template>
    <mu-button slot="actions" flat color="primary" @click="onConfirm()">
      <template v-if="isSupported">确定</template>
      <template v-else>好的</template>
    </mu-button>
  </mu-dialog>
</template>

<script>
import DarkMode from '@/plugin/darkmode'

export default {
  props: {
    open: Boolean,
  },
  data() {
    return {
      isSupported: DarkMode.isSupported(),
      value: DarkMode.get(),
    }
  },
  methods: {
    onConfirm() {
      this.$emit('update:open', false)
      if (!this.isSupported) {
        return
      }
      // apply dark mode after dialog closed
      setTimeout(() => {
        DarkMode.set(this.value)
        this.$emit('change')
      }, 150)
    },
    onUpdateOpen(event) {
      this.value = DarkMode.get()
      this.$emit('update:open', event)
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.dark-mode-dialog /deep/ .mu-dialog {
  width: 90%;
  max-width: 300 * @pr;
}

.dark-mode-option {
  display: flex;
  padding: 8 * @pr 0;
  & /deep/ .mu-radio-label {
    min-width: 120 * @pr;
  }
}
</style>