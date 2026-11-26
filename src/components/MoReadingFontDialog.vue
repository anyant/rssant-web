<template>
  <mu-dialog
    class="reading-font-dialog"
    ref="dialog"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-label="阅读字号"
    title="阅读字号"
    :open="open"
    :overlay-close="true"
    v-on:update:open="onUpdateOpen"
  >
    <div class="font-preview" :style="{ fontSize: value + 'px' }">
      我们常常高估一年能做成的事，却低估十年能做成的事。
    </div>
    <div
      class="font-option"
      v-for="size in sizes"
      :key="size"
      @click="select(size)"
      @keydown="onOptionKeydown($event, size)"
    >
      <mu-radio :value="size" v-model="value" :label="labelOf(size)" :ripple="false"></mu-radio>
    </div>
    <mu-button slot="actions" flat color="primary" @click="close">完成</mu-button>
  </mu-dialog>
</template>

<script>
import reading from '@/plugin/reading'

const LABELS = {
  13: '小',
  15: '标准',
  17: '大',
  20: '特大',
}

export default {
  props: {
    open: Boolean,
  },
  data() {
    return {
      sizes: reading.sizes,
      value: reading.fontSize,
    }
  },
  watch: {
    open(value) {
      if (!value) {
        return
      }
      this.value = reading.fontSize
      this.$nextTick(() => {
        // 打开时把焦点移进对话框，避免键盘操作落到背后的页面
        setTimeout(() => {
          if (this.$refs.dialog) {
            this.$refs.dialog.$el.focus()
          }
        }, 0)
      })
    },
    value(value) {
      // 选档即生效，关闭对话框不会丢掉选择
      reading.setFontSize(value)
    },
  },
  methods: {
    labelOf(size) {
      return LABELS[size]
    },
    select(size) {
      this.value = size
    },
    close() {
      this.$emit('update:open', false)
    },
    optionElements() {
      return Array.from(this.$el.querySelectorAll('.font-option .mu-radio'))
    },
    onOptionKeydown(event, size) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        let index = this.sizes.indexOf(size)
        let delta = event.key === 'ArrowDown' ? 1 : -1
        let next = this.sizes[(index + delta + this.sizes.length) % this.sizes.length]
        this.select(next)
        this.$nextTick(() => {
          let element = this.optionElements()[this.sizes.indexOf(next)]
          if (element) {
            element.focus()
          }
        })
      } else if (event.key === ' ' || event.key === 'Spacebar') {
        // mu-radio 只处理 Enter，Space 在这里补上，同时避免页面滚动
        event.preventDefault()
        this.select(size)
      }
    },
    onUpdateOpen(value) {
      this.$emit('update:open', value)
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.reading-font-dialog /deep/ .mu-dialog {
  width: 90%;
  max-width: 300 * @pr;
}

.reading-font-dialog:focus,
.reading-font-dialog /deep/ .mu-dialog:focus {
  outline: none;
}

.font-preview {
  display: flex;
  align-items: center;
  min-height: 88 * @pr;
  margin-bottom: 8 * @pr;
  padding: 12 * @pr;
  border-radius: 4 * @pr;
  background: darken(@antBackGrey, 2%);
  color: @antTextSemi;
  line-height: 1.5;
}

.font-option {
  display: flex;
  padding: 12 * @pr 8 * @pr;
  margin: 0 -8 * @pr;
  border-radius: 4 * @pr;
  cursor: pointer;
}

.font-option:focus-within {
  background: @antBackGrey;
}
</style>
