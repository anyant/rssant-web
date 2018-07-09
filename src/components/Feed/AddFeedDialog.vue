<template>
  <mu-dialog :open="open" title="添加新订阅" @close="close">
    <mu-text-field
      v-model="feedUrl"
      label="请填入你想要订阅的供稿的地址"
      label-float
      fullWidth
      :errorText="errorText"
      @focus="handleInputFocus"
      @keyup.enter.native="handleSave"
    />
    <mu-flat-button slot="actions" primary @click="handleSave" :disabled="saveDisabled" label="确定"/>
    <mu-flat-button slot="actions" @click="close" label="取消"/>
  </mu-dialog>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      default: false
    },
    close: {
      type: Function
    },
    save: {
      type: Function
    }
  },
  computed: {
    saveDisabled() {
      return !this.feedUrl
    }
  },
  data() {
    return {
      feedUrl: null,
      errorText: null
    }
  },
  methods: {
    async handleSave() {
      if (!this.saveDisabled && this.save) {
        try {
          await this.save(this.feedUrl)
          this.$notify.success({ duration: 3000, message: '订阅添加成功～' })
          this.close()
          this.feedUrl = null
        } catch (e) {
          this.errorText = e.message
        }
      }
    },
    handleInputFocus() {
      this.errorText = null
    }
  }
}
</script>

<style>

</style>
