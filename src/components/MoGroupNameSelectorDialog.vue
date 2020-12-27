<template>
  <mu-dialog
    class="group-name-selector-dialog"
    :title="title"
    :overlay-close="false"
    :open="open"
    v-on:update:open="onUpdateOpen"
  >
    <mu-text-field class="group-input" full-width v-model="groupName" placeholder="请输入或选择分组"></mu-text-field>
    <MoGroupNameSelector class="group-name-selector" @select="onSelect"></MoGroupNameSelector>
    <mu-button slot="actions" flat @click="onCancel()">取消</mu-button>
    <mu-button
      slot="actions"
      :disabled="!isConfirmEnable"
      flat
      color="primary"
      @click="onConfirm()"
    >确定</mu-button>
  </mu-dialog>
</template>

<script>
import _ from 'lodash'
import MoGroupNameSelector from '@/components/MoGroupNameSelector.vue'

export default {
  components: { MoGroupNameSelector },
  props: {
    title: String,
    value: String,
    open: Boolean,
  },
  data() {
    return {
      groupName: this.value,
      isConfirmLoading: false,
    }
  },
  computed: {
    isConfirmEnable() {
      return !_.isEmpty(this.groupName)
    },
  },
  watch: {
    open: function(value, oldValue) {
      if (value) {
        this.groupName = this.value
      }
      this.isConfirmLoading = false
    },
  },
  methods: {
    onSelect(name) {
      this.groupName = name
    },
    onConfirm() {
      if (this.isConfirmLoading) {
        return
      }
      this.isConfirmLoading = true
      let done = () => this.closeDialog()
      this.$emit('confirm', { value: this.groupName, done: done })
    },
    onCancel() {
      this.closeDialog()
    },
    closeDialog() {
      this.$emit('update:open', false)
      this.groupName = null
      this.isConfirmLoading = false
    },
    onUpdateOpen(event) {
      this.$emit('update:open', event)
    },
  },
}
</script>


<style lang="less" scoped>
@import '~@/styles/common';

.group-name-selector {
  margin-right: -16 * @pr;
}

.group-name-selector-dialog /deep/ .mu-dialog {
  margin-top: -32 * @pr;
  width: 600 * @pr;
  max-width: 90%;
  max-width: calc(100vw - 30 * @pr);
}

@media only screen and (min-width: 630*@pr) {
  .group-name-selector-dialog /deep/ .mu-dialog {
    max-width: 600 * @pr;
  }
}

.group-input.mu-input {
  padding-top: 8 * @pr;
}

.group-input.mu-input /deep/ .mu-text-field-input {
  height: 24 * @pr;
}
</style>
