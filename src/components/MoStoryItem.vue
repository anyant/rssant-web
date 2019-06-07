<template>
  <div class="story-item">
    <div class="story-header" :class="{ 'story-header-readed': isReaded }" @click="onOpen">
      <div class="story-title">{{ title || link }}</div>
      <div class="story-date">{{ dateText }}</div>
      <mu-button icon class="story-favorited" @click.stop="toggleFavorited">
        <mu-icon v-if="isFavorited" value="star" :color="starColor"></mu-icon>
        <mu-icon v-else value="star_border" :color="starColor"></mu-icon>
      </mu-button>
    </div>
    <div
      class="story-preview"
      v-if="isOpened"
      :class="{'story-preview-readed': isReaded && !isReading}"
    >
      <div class="story-preview-title" v-if="previewTitle">{{ title }}</div>
      <div class="story-preview-summary">{{ summary }}</div>
      <mu-button icon class="story-preview-link" @click.stop="goLink">
        <i class="fa fa-external-link" aria-hidden="true"></i>
      </mu-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'
import { formatDate } from '@/plugin/datefmt'

export default {
  props: {
    isReaded: {
      type: Boolean,
      default: false
    },
    isReading: {
      type: Boolean,
      default: false
    },
    isFavorited: {
      type: Boolean,
      default: false
    },
    title: String,
    date: String,
    summary: String,
    content: String,
    link: String,
    routerLink: String
  },
  data() {
    return {
      isOpened: false
    }
  },
  computed: {
    previewTitle() {
      return !_.isEmpty(this.title) && this.title.length >= 10
    },
    dateText() {
      return formatDate(this.date)
    },
    starColor() {
      if (this.isFavorited) {
        return antGold
      } else {
        return null
      }
    }
  },
  methods: {
    toggleFavorited() {
      this.$emit('toggleFavorited')
    },
    goLink() {
      if (!_.isEmpty(this.link) && (_.isEmpty(this.content) || this.content.length <= 20)) {
        window.open(this.link, '_blank')
      } else if (!_.isEmpty(this.routerLink)) {
        this.$router.push(this.routerLink)
      }
    },
    onOpen() {
      this.$emit('read')
      if (_.isEmpty(this.summary)) {
        this.goLink()
      } else {
        this.isOpened = !this.isOpened
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.story-item {
  background: #fff;
}

.story-header,
.story-preview {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
}

.story-header {
  position: relative;
  height: 40 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.story-header-readed {
  .story-title,
  .story-date,
  .story-favorited {
    color: @antTextLight;
  }
}

.story-preview-readed {
  opacity: 0.42;
}

.story-title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15 * @pr;
}

.story-date {
  flex-shrink: 0;
  width: 64 * @pr;
  margin-left: 4 * @pr;
  font-size: 12 * @pr;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;
}

.story-favorited {
  flex-shrink: 0;
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-left: 4 * @pr;
}

.story-preview {
  padding-bottom: 8 * @pr;
  position: relative;
}

.story-preview-title {
  line-height: 23 * @pr;
  font-size: 15 * @pr;
  font-weight: bold;
}

.story-preview-summary {
  padding-top: 8 * @pr;
  min-height: 21 * @pr;
  max-height: 480 * @pr;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  font-size: 15 * @pr;
}

.story-preview-link {
  position: absolute;
  right: 16 * @pr;
  bottom: 12 * @pr;
  font-size: 14 * @pr;
  width: 24 * @pr;
  height: 24 * @pr;
  color: @antBlue;
  box-shadow: 0 0 2 * @pr 1 * @pr @antBlue;
  background: rgba(#fff, 90%);

  .fa {
    position: relative;
    left: 1 * @pr;
    top: 1 * @pr;
  }
}
</style>