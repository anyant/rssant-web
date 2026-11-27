<template>
  <div class="reading-actions">
    <div class="action-menu-wrapper">
      <mu-button
        icon
        ref="actionMoreRef"
        class="action-more"
        aria-label="更多"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen ? 'true' : 'false'"
        data-mu-loading-size="16"
        v-loading="isFetchLoading"
        @click="onMoreClick"
      >
        <fa-icon size="18" v-if="!isFetchLoading" icon="ellipsis-h" />
      </mu-button>
      <mu-list
        class="reading-menu"
        :class="{ 'is-keyboard': isMenuKeyboard }"
        ref="actionMenuListRef"
        v-show="isMenuOpen"
        role="menu"
        @keydown.native="onMenuKeydown"
      >
        <mu-list-item
          button
          role="menuitem"
          tabindex="0"
          data-menu-action="font"
          @click="openReadingFont"
        >
          <mu-list-item-title>阅读字号</mu-list-item-title>
        </mu-list-item>
        <mu-list-item
          button
          role="menuitem"
          tabindex="0"
          data-menu-action="fetch"
          @click="onFetchFulltextFromMenu"
        >
          <mu-list-item-title>抓取全文</mu-list-item-title>
        </mu-list-item>
      </mu-list>
    </div>
    <mu-button
      icon
      class="action-favorited"
      :aria-label="isFavorited ? '取消收藏' : '收藏'"
      @click="$emit('favorite')"
    >
      <fa-icon size="18" v-if="isFavorited" icon="star" :color="starColor" />
      <fa-icon size="18" v-else icon="far/star" :color="starColor" />
    </mu-button>
  </div>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'

export default {
  name: 'MoReadingActions',
  props: {
    isFavorited: {
      type: Boolean,
      default: false,
    },
    isFetchLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isMenuOpen: false,
      isMenuKeyboard: false,
    }
  },
  computed: {
    starColor() {
      return this.isFavorited ? antGold : null
    },
  },
  beforeDestroy() {
    this.removeMenuListeners()
  },
  methods: {
    onMoreClick(event) {
      // 抓取全文时 ⋯ 只显示进度，不展开菜单
      if (this.isFetchLoading) {
        return
      }
      // 键盘触发的 click，detail 为 0
      this.toggleMenu(event.detail === 0)
    },
    toggleMenu(fromKeyboard) {
      if (this.isMenuOpen) {
        this.closeMenu()
        return
      }
      this.isMenuOpen = true
      this.isMenuKeyboard = fromKeyboard
      window.addEventListener('click', this.onDocumentClick)
      window.addEventListener('keydown', this.onDocumentKeydown)
      if (fromKeyboard) {
        this.focusMenuItem(0)
      }
    },
    closeMenu() {
      if (!this.isMenuOpen) {
        return
      }
      this.isMenuOpen = false
      this.removeMenuListeners()
    },
    removeMenuListeners() {
      window.removeEventListener('click', this.onDocumentClick)
      window.removeEventListener('keydown', this.onDocumentKeydown)
    },
    onDocumentClick(event) {
      let button = this.$refs.actionMoreRef
      let menu = this.$refs.actionMenuListRef
      if (!_.isNil(button) && button.$el.contains(event.target)) {
        return
      }
      if (!_.isNil(menu) && menu.$el.contains(event.target)) {
        return
      }
      this.closeMenu()
    },
    onDocumentKeydown(event) {
      if (event.key !== 'Escape') {
        return
      }
      this.closeMenu()
      this.focusMoreButton()
    },
    menuItems() {
      let menu = this.$refs.actionMenuListRef
      if (_.isNil(menu)) {
        return []
      }
      return Array.from(menu.$el.querySelectorAll('[data-menu-action]'))
    },
    focusMenuItem(index) {
      this.$nextTick(() => {
        let items = this.menuItems()
        if (items.length > 0) {
          items[index].focus()
        }
      })
    },
    focusMoreButton() {
      this.$nextTick(() => {
        let button = this.$refs.actionMoreRef
        if (!_.isNil(button)) {
          button.$el.focus()
        }
      })
    },
    onMenuKeydown(event) {
      let items = this.menuItems()
      let index = items.indexOf(event.target)
      if (index === -1) {
        return
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        let delta = event.key === 'ArrowDown' ? 1 : -1
        items[(index + delta + items.length) % items.length].focus()
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        items[event.key === 'Home' ? 0 : items.length - 1].focus()
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        let action = event.target.getAttribute('data-menu-action')
        if (action === 'font') {
          this.openReadingFont()
        } else {
          this.onFetchFulltextFromMenu()
        }
      }
    },
    openReadingFont() {
      this.closeMenu()
      this.$emit('font')
    },
    onFetchFulltextFromMenu() {
      this.closeMenu()
      this.$emit('fetch')
    },
    focusMoreButtonAfterDialog() {
      this.focusMoreButton()
    },
  },
}
</script>

<style lang="less">
@import '~@/styles/common';

// reading-menu 只用在阅读页的 ⋯ 菜单，避免和首页的 .action-menu-list 互相影响
.reading-menu {
  .header-menu-popover;

  // 相对 ⋯ 按钮（.action-menu-wrapper）定位：距头部底边 8px、距按钮底边 17px；右边缘与按钮对齐
  top: calc(100% + 17 * @pr) !important;
  right: -4 * @pr;
  min-width: 112 * @pr;
  overflow: hidden;

  li:focus {
    outline: none;
  }

  li .mu-item:hover,
  &.is-keyboard li:focus .mu-item,
  li:focus-visible .mu-item {
    background: @antLineGrey;
  }

  animation: action-menu-in 120ms ease-out;
}

@keyframes action-menu-in {
  from {
    opacity: 0;
    transform: translateY(-4 * @pr);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style lang="less" scoped>
@import '~@/styles/common';

.reading-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.action-menu-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 16 * @pr;
}

.action-more,
.action-favorited {
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}
</style>
