<template>
  <mu-dialog v-if="isOpen" :open="isOpen" @close="onClose" width="500">
    <template v-slot:title>添加新订阅</template>
    <mu-text-field
      ref="feedUrl"
      v-model="feedUrl"
      label="请填入你想要订阅的供稿地址"
      label-float
      full-width
      :error-text="errorText"
      @focus="onFocus"
      @keyup.enter.native="onSave"
    />
    <mu-button flat slot="actions" color="primary" @click="onSave" :disabled="isSaveDisabled">确定</mu-button>
    <mu-button flat slot="actions" @click="onClose">取消</mu-button>
  </mu-dialog>
</template>

<script>
/**
 * API:
 *    close()
 *    open()
 */
import Vue from 'vue'

const signal = new Vue()

export const API = {
  open() {
    signal.$emit('open')
  },
  close() {
    signal.$emit('close')
  }
}

export default {
  data() {
    return {
      signal: signal,
      isOpen: false,
      feedUrl: null,
      errorText: null
    }
  },
  computed: {
    isSaveDisabled() {
      return !this.feedUrl
    }
  },
  created() {
    this.signal.$on('close', this.onClose)
    this.signal.$on('open', this.onOpen)
  },
  methods: {
    focusInput() {
      // https://github.com/museui/muse-ui/issues/219
      this.$nextTick(() => {
        if (this.$refs.feedUrl) {
          let el = this.$refs.feedUrl.$el
          el.querySelector('input').focus()
        }
      })
    },
    onOpen() {
      this.isOpen = true
      setTimeout(() => {
        this.onFocus()
      }, 300)
    },
    onClose() {
      this.isOpen = false
    },
    async onSave() {
      if (this.isSaveDisabled) {
        return
      }
      try {
        await this.$StoreAPI.feed.createFeed({ url: this.feedUrl })
        this.onClose()
        this.feedUrl = null
      } catch (error) {
        this.errorText = error.message
      }
    },
    onFocus() {
      this.errorText = null
      this.focusInput()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
