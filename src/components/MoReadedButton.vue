<template>
  <div class="readed-button" ref="readedButtonRef" :class="{'long-press': isLongPressActive}">
    <div class="readed-action">
      <fa-icon class="readed-icon" icon="check" :size="16" />
    </div>
    <MoHeaderTip :open.sync="isTipActive" :trigger="tipTrigger" content="按住全标已读" />
  </div>
</template>

<script>
import _ from 'lodash'
import MoHeaderTip from '@/components/MoHeaderTip.vue'

// https://stackoverflow.com/questions/1930895/how-long-is-the-event-onlongpress-in-the-android
const LONG_PRESS_DURATION = 500
const TIP_DURATION = 3000

export default {
  components: { MoHeaderTip },
  data() {
    return {
      tipTrigger: null,
      pressTimer: null,
      tipTimer: null,
      isTipActive: false,
      isLongPressActive: false,
    }
  },
  mounted() {
    let el = this.$refs.readedButtonRef
    this.tipTrigger = el
    el.addEventListener('touchstart', this.handleTouchStart)
    el.addEventListener('mousedown', this.handleMouseStart)
  },
  beforeDestroy() {
    this.isTipActive = false
    this.isLongPressActive = false
    let el = this.$refs.readedButtonRef
    el.removeEventListener('touchstart', this.handleTouchStart)
    el.removeEventListener('mousedown', this.handleMouseStart)
    this.removeDocumentListeners()
    this.clearPressTimer()
    this.clearTipTimer()
  },
  methods: {
    removeDocumentListeners() {
      document.removeEventListener('touchend', this.handlePressEnd)
      document.removeEventListener('touchcancel', this.handlePressEnd)
      document.removeEventListener('mouseup', this.handlePressEnd)
    },
    setupDocumentListeners() {
      this.removeDocumentListeners()
      document.addEventListener('touchend', this.handlePressEnd)
      document.addEventListener('touchcancel', this.handlePressEnd)
      document.addEventListener('mouseup', this.handlePressEnd)
    },
    setupPressTimer() {
      this.clearPressTimer()
      this.pressTimer = setTimeout(() => {
        this.isTipActive = false
        this.isLongPressActive = true
        this.clearPressTimer()
        this.clearTipTimer()
        this.onLongPress()
      }, LONG_PRESS_DURATION)
    },
    clearPressTimer() {
      if (!_.isNil(this.pressTimer)) {
        clearTimeout(this.pressTimer)
        this.pressTimer = null
      }
    },
    setupTipTimer() {
      this.clearTipTimer()
      this.tipTimer = setTimeout(() => {
        this.isTipActive = false
        this.clearTipTimer()
      }, TIP_DURATION)
    },
    clearTipTimer() {
      if (!_.isNil(this.tipTimer)) {
        clearTimeout(this.tipTimer)
        this.tipTimer = null
      }
    },
    handleTouchStart(e) {
      this._handlePressStart(e)
    },
    handleMouseStart(e) {
      // 0: Main button, usually the left button
      if (!_.isNil(e.button) && e.button !== 0) {
        return
      }
      this._handlePressStart(e)
    },
    _handlePressStart(e) {
      if (e.cancelable) {
        e.preventDefault()
      }
      this.setupDocumentListeners()
      this.setupPressTimer()
    },
    handlePressEnd(e) {
      if (e.cancelable) {
        e.preventDefault()
      }
      this.removeDocumentListeners()
      if (!_.isNil(this.pressTimer)) {
        this.isTipActive = true
        this.setupTipTimer()
      }
      this.clearPressTimer()
      this.isLongPressActive = false
    },
    onLongPress() {
      this.$emit('click')
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.readed-button {
  width: 32 * @pr;
  height: 32 * @pr;
}

.readed-action {
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextSemi;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16 * @pr;
  cursor: pointer;
  &:hover {
    background: fade(@antTextSemi, 12%);
  }
}

.long-press .readed-icon {
  color: @antGold;
}

.readed-icon {
  margin-left: 0;
  margin-right: 0;
}
</style>
