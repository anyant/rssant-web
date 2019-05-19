<template>
  <div class="creation-item" @click="onClick">
    <div class="status" :style="statusStyle"></div>
    <div class="title">{{ title }}</div>
    <div class="date">{{ dateText }}</div>
  </div>
</template>

<script>
import _ from 'lodash'
import { antGreen, antBlue, antRed, antRippleGrey } from '@/plugin/common'
import { formatDate } from '@/plugin/datefmt'

export default {
  props: {
    status: String,
    title: String,
    date: String,
    routerLink: String
  },
  computed: {
    dateText() {
      return formatDate(this.date)
    },
    color() {
      const colorMap = {
        ready: antGreen,
        error: antRed,
        updating: antBlue,
        pending: antRippleGrey
      }
      return _.defaultTo(colorMap[this.status], antRippleGrey)
    },
    statusStyle() {
      return { background: this.color }
    }
  },
  data() {
    return {}
  },
  methods: {
    onClick() {
      this.$router.push(this.routerLink)
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.creation-item {
  position: relative;
  height: 40 * @pr;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.status {
  display: inline-block;
  width: 8 * @pr;
  height: 8 * @pr;
  border-radius: 4px;
  margin-right: 8 * @pr;
}

.title {
  flex-grow: 1;
  margin-right: 16 * @pr;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15 * @pr;
}

.date {
  flex-shrink: 0;
  width: 64 * @pr;
  font-size: 12 * @pr;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;
}
</style>