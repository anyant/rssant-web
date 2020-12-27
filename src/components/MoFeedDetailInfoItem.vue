<template>
  <div class="feed-detail-info-item" :class="{'editable': editable}">
    <div class="item-main">
      <span class="item-name">{{ name }}</span>
      <div class="item-info">
        <template v-if="isEdit">
          <input class="item-input" v-model="editValue" />
          <span class="item-button item-button-save" @click="onSave()">
            <fa-icon class="item-button-icon" :color="antBlue" icon="save" />
          </span>
        </template>
        <template v-else>
          <a
            v-if="type === 'link'"
            class="item-link"
            :href="link || value"
            target="_blank"
          >{{ value }}</a>
          <router-link
            v-else-if="type === 'router-link'"
            class="item-link"
            :to="link || value"
          >{{ value }}</router-link>
          <span v-else class="item-value">{{ value }}</span>
          <span v-if="editable" class="item-button item-button-edit" @click="onEdit()">
            <fa-icon class="item-button-icon" icon="edit" />
          </span>
        </template>
      </div>
    </div>
    <slot v-if="isEdit"></slot>
  </div>
</template>

<script>
import { antBlue } from '@/plugin/common'

export default {
  props: {
    name: String,
    type: String,
    value: [Number, String],
    link: String,
    editable: Boolean,
  },
  data() {
    return {
      antBlue,
      isEdit: false,
      isSaveLoading: false,
      editValue: null,
    }
  },
  methods: {
    setEditValue(value) {
      this.editValue = value
    },
    onEdit() {
      this.editValue = this.value
      this.isEdit = true
      this.isSaveLoading = false
    },
    onSave() {
      if (this.isSaveLoading) {
        return
      }
      this.isSaveLoading = true
      let done = () => {
        this.isEdit = false
        this.isSaveLoading = false
      }
      if (this.editValue !== this.value) {
        this.$emit('save', {
          value: this.editValue,
          done: done,
        })
      } else {
        done()
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-detail-info-item {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 13 * @pr;
  font-size: 15 * @pr;
}

.item-main {
  display: flex;
  align-items: center;
}

.editable .item-main {
  min-height: 52 * @pr;
}

.item-name {
  flex-shrink: 0;
  display: inline-block;
  text-align: right;
  width: 64 * @pr;
  margin-right: 24 * @pr;
}

.item-info {
  width: 100%;
  overflow: hidden;
  text-overflow: clip;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-value,
.item-link {
  max-height: 4 * 22 * @pr;
  word-break: break-word;
}

.item-link {
  color: @antBlue;
}

.item-value,
.item-link,
.item-input {
  font-size: 15 * @pr;
  min-height: 22 * @pr;
  line-height: 22 * @pr;
  border-bottom: 1 * @pr solid transparent;
}

.item-input {
  appearance: none;
  outline: none;
  border: none;
  border-radius: 0;
  background: none;
  box-shadow: none;
  resize: none;
  display: block;
  padding: 0;
  margin: 0;
}

.item-input {
  width: 100%;
  color: @antTextSemi;
  border-bottom: 1 * @pr solid @antBlue;
}

.item-button {
  padding-right: 8 * @pr;
  padding-left: 8 * @pr;
  cursor: pointer;
}

.item-button .item-button-icon {
  display: inline-block;
  width: 24 * @pr;
}

.item-button-save {
  margin-right: -4 * @pr;
  position: relative;
  top: 1 * @pr;
  .item-button-icon {
    height: 18 * @pr;
  }
}

.item-button-edit {
  margin-right: -5 * @pr;
  .item-button-icon {
    height: 16 * @pr;
  }
}
</style>