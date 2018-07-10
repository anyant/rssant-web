<template>
  <mu-dialog :open="isOpen" title="添加新订阅" @close="close" width="500">
    <mu-text-field v-model="feedUrl" label="请填入你想要订阅的供稿地址" label-float fullWidth :errorText="errorText" @focus="handleInputFocus" @keyup.enter.native="handleSave" />
    <mu-button flat slot="actions" color="primary" @click="handleSave" :disabled="saveDisabled">确定</mu-button>
    <mu-button flat slot="actions" @click="close">取消</mu-button>
  </mu-dialog>
</template>

<script>
export default {
  props: {
    isOpen: {
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
      if (this.saveDisabled || !this.save) {
        return
      }
      try {
        await this.save(this.feedUrl)
        this.$notify.success({ duration: 3000, message: '订阅添加成功～' })
        this.close()
        this.feedUrl = null
      } catch (e) {
        this.errorText = e.message
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
