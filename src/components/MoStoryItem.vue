<template>
  <div class="story-item" :class="{'story-item-ctrl':isCtrlKeyHold}">
    <div
      class="story-header"
      :class="{ 'story-header-readed': isReaded }"
      v-if="!isOpened"
      @click="onOpen"
    >
      <div class="story-title">{{ title || link }}</div>
      <div class="story-date">{{ dateText }}</div>
    </div>
    <div
      class="story-preview"
      :class="{'story-preview-readed': isReaded && !isReading}"
      v-if="isOpened"
    >
      <div class="story-preview-header" @click="onOpen">
        <div class="story-preview-title">{{ title }}</div>
        <mu-button icon class="story-favorited" @click.stop="toggleFavorited">
          <fa-icon size="18" v-if="isFavorited" icon="star" :color="starColor" />
          <fa-icon size="18" v-else icon="far/star" :color="starColor" />
        </mu-button>
      </div>
      <div class="story-preview-summary" @click="handleSummaryClick">{{ summary }}</div>
      <div class="story-preview-link" @click="goLink">
        <MoIconAngleRight3 class="story-preview-link-fade" />
        <MoIconAngleRight3 class="story-preview-link-main" />
        <MoIconAngleRight3 class="story-preview-link-fade" />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'
import { formatDateFriendly } from '@/plugin/datefmt'
import MoIconAngleRight3 from '@/components/MoIconAngleRight3'

export default {
  components: { MoIconAngleRight3 },
  props: {
    isOpened: {
      type: Boolean,
      default: false,
    },
    isReaded: {
      type: Boolean,
      default: false,
    },
    isReading: {
      type: Boolean,
      default: false,
    },
    isFavorited: {
      type: Boolean,
      default: false,
    },
    isCtrlKeyHold: {
      type: Boolean,
      default: false,
    },
    feedId: String,
    offset: Number,
    title: String,
    date: String,
    summary: String,
    content: String,
    link: String,
  },
  data() {
    return {}
  },
  computed: {
    dateText() {
      return formatDateFriendly(this.date)
    },
    starColor() {
      if (this.isFavorited) {
        return antGold
      } else {
        return null
      }
    },
    routerLink() {
      return `/story?feed=${this.feedId}&offset=${this.offset}`
    },
  },
  methods: {
    toggleFavorited() {
      this.$emit('toggleFavorited')
    },
    handleSummaryClick() {
      if (this.isCtrlKeyHold) {
        this.openLinkInNewTab()
      }
    },
    openLinkInNewTab() {
      if (!_.isEmpty(this.link)) {
        window.open(this.link, '_blank')
      } else if (!_.isEmpty(this.routerLink)) {
        this.$router.push(this.routerLink)
      }
    },
    goLink() {
      let isPoorContent = _.isEmpty(this.content) || this.content.length <= 20
      if (!_.isEmpty(this.link) && (this.isCtrlKeyHold || isPoorContent)) {
        this.openLinkInNewTab()
      } else if (!_.isEmpty(this.routerLink)) {
        this.$router.push(this.routerLink)
      }
    },
    async onOpen() {
      if (_.isEmpty(this.summary) || _.isEmpty(this.content)) {
        let promise = this.$API.story.load({ feedId: this.feedId, offset: this.offset, detail: true })
        if (_.isEmpty(this.summary) && _.isEmpty(this.content)) {
          await promise
        }
      }
      this.$emit('read')
      if (!this.isOpened && this.isCtrlKeyHold) {
        this.openLinkInNewTab()
      } else {
        this.$emit('update:isOpened', !this.isOpened)
      }
    },
  },
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
  .story-date {
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
  width: 48 * @pr;
  margin-left: 4 * @pr;
  font-size: 12 * @pr;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;
}

.story-preview {
  padding-top: 9 * @pr;
  padding-bottom: 1 * @pr;
  position: relative;
}

.story-preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.story-preview-title {
  line-height: 23 * @pr;
  font-size: 15 * @pr;
  font-weight: bold;
  padding-right: 28 * @pr;
}

.story-preview-summary {
  padding-top: 8 * @pr;
  max-height: 480 * @pr;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  font-size: 15 * @pr;
}

.story-item-ctrl .story-preview-summary:hover {
  cursor: pointer;
}

.story-favorited {
  flex-shrink: 0;
  position: absolute;
  top: 3 * @pr;
  right: 12 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
}

.story-preview-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6 * @pr;
  padding-bottom: 3 * @pr;
  margin-top: -4 * @pr;
  cursor: pointer;

  .story-preview-link-main {
    color: @antBlue;
  }
  .story-preview-link-fade {
    color: @antLineGrey;
  }
}

.story-header,
.story-preview-header {
  cursor: pointer;
}
</style>