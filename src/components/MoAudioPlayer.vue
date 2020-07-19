<template>
  <div class="audio-player">
    <div class="audio-button-play" @click="togglePlay">
      <fa-icon class="audio-icon" :icon="isPaused?'play-circle':'pause-circle'" size="32" />
    </div>
    <div class="audio-main">
      <div
        class="audio-slider"
        ref="audioSlider"
        :class="{'audio-slider-seekable':isSliderSeekable}"
      >
        <input type="hidden" v-model="audioProgress" />
        <div class="audio-slider-track"></div>
        <div class="audio-slider-buffer" :style="sliderBufferStyle"></div>
        <div class="audio-slider-progress" :style="sliderProgressStyle"></div>
      </div>
      <div class="audio-time">
        <span class="audio-time-now">{{ formatTime(audioProgress) }}</span>
        <span class="audio-error" v-if="audioError">{{ audioError }}</span>
        <span class="audio-loading" v-if="isShowLoading">
          <svg aria-hidden="true" aria-label="loading" aria-live="polite" viewBox="0 0 66 66">
            <circle
              cx="33"
              cy="33"
              r="30"
              fill="transparent"
              stroke="url(#audio-gradient)"
              stroke-dasharray="170"
              stroke-dashoffset="20"
              stroke-width="6"
            />
            <linearGradient id="audio-gradient">
              <stop offset="50%" stop-color="currentColor" />
              <stop offset="65%" stop-color="currentColor" stop-opacity="0.5" />
              <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
            </linearGradient>
          </svg>
        </span>
        <span class="audio-time-duration">{{ formatTime(audioDuration) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // state
      isPaused: true,
      isSeeking: false,
      isAudioReady: false,
      isAudioEnded: false,
      isAudioWaiting: false,
      // attribute
      audio: null,
      audioChecker: null,
      audioError: null,
      audioDuration: 0,
      isAudioSeekable: true,
      // buffer and progress
      audioBuffer: 0,
      audioProgress: 0,
    }
  },
  computed: {
    sliderRef() {
      return this.$refs.audioSlider
    },
    sliderProgressStyle() {
      if (!this.isAudioReady || this.audioDuration <= 0) {
        return null
      }
      let percent = ((this.audioProgress / this.audioDuration) * 100).toFixed(2)
      return {
        width: `${percent}%`,
      }
    },
    sliderBufferStyle() {
      if (!this.isAudioReady || this.audioDuration <= 0) {
        return null
      }
      let percent = ((this.audioBuffer / this.audioDuration) * 100).toFixed(2)
      return {
        width: `${percent}%`,
      }
    },
    isShowLoading() {
      return !this.isPaused && this.isAudioWaiting && !this.audioError
    },
    isSliderSeekable() {
      return this.isAudioReady && this.audioDuration > 0 && this.isAudioSeekable
    },
  },
  mounted() {
    this.initAudio()
    this.initSlider()
  },
  destroyed() {
    this.destroySlider()
    this.destroyAudio()
  },
  methods: {
    formatTime(time) {
      time = Math.round(time)
      let hour = Math.floor(time / 3600)
      let min = Math.floor((time - hour * 3600) / 60)
      let sec = Math.floor(time - hour * 3600 - min * 60)
      min = min < 10 ? '0' + min : min
      sec = sec < 10 ? '0' + sec : sec
      if (hour === 0) {
        return `${min}:${sec}`
      }
      hour = hour < 10 ? '0' + hour : hour
      return `${hour}:${min}:${sec}`
    },
    handlePlayError(error) {
      let isNotSupportedError =
        error.name === 'NotSupportedError' || error.code === 9 || error.name === 'NOT_SUPPORTED_ERR'
      let isNotAllowedError = error.name === 'NotAllowedError'
      let isAbortError = error.name === 'AbortError' || error.code === 20 || error.name === 'ABORT_ERR'
      let isUnknownError = !isAbortError && !_.isNil(this.audio.error)
      if (isNotSupportedError || isNotAllowedError || isUnknownError) {
        this.audioError = '音频无法播放'
      }
    },
    togglePlay() {
      this.isPaused = !this.isPaused
      if (!this.isPaused) {
        this.audio.preload = 'auto'
        let promise = this.audio.play()
        if (!_.isNil(promise)) {
          promise
            .then(() => {
              this.audioError = null
            })
            .catch(error => {
              this.handlePlayError(error)
            })
        }
      } else {
        this.audio.pause()
      }
      this.syncAudioSeekable()
    },
    // slider element
    initSlider() {
      this.sliderRef.addEventListener('touchstart', this.handleTouchStart)
      this.sliderRef.addEventListener('mousedown', this.handleMouseStart)
    },
    destroySlider() {
      this.sliderRef.removeEventListener('touchstart', this.handleTouchStart)
      this.sliderRef.removeEventListener('mousedown', this.handleMouseStart)
      // ensure remove all listener
      document.removeEventListener('touchmove', this.handleTouchMove)
      document.removeEventListener('touchend', this.handleTouchEnd)
      document.removeEventListener('touchcancel', this.handleTouchEnd)
      document.removeEventListener('mousemove', this.handleMouseMove)
      document.removeEventListener('mouseup', this.handleMouseEnd)
    },
    // touch events
    handleTouchStart(e) {
      if (this.isSliderSeekable) {
        this.isSeeking = true
        this.setProgress(e.touches[0])
        document.addEventListener('touchmove', this.handleTouchMove)
        document.addEventListener('touchend', this.handleTouchEnd)
        document.addEventListener('touchcancel', this.handleTouchEnd)
        if (e.cancelable) {
          e.preventDefault()
        }
      }
    },
    handleTouchEnd(e) {
      this.applyAudioProgress()
      document.removeEventListener('touchmove', this.handleTouchMove)
      document.removeEventListener('touchend', this.handleTouchEnd)
      document.removeEventListener('touchcancel', this.handleTouchEnd)
      if (e.cancelable) {
        e.preventDefault()
      }
    },
    handleTouchMove(e) {
      this.setProgress(e.touches[0])
    },
    // mouse events
    handleMouseStart(e) {
      if (this.isSliderSeekable) {
        this.isSeeking = true
        this.setProgress(e)
        document.addEventListener('mousemove', this.handleMouseMove)
        document.addEventListener('mouseup', this.handleMouseEnd)
        if (e.cancelable) {
          e.preventDefault()
        }
      }
    },
    handleMouseEnd(e) {
      this.setProgress(e)
      this.applyAudioProgress()
      document.removeEventListener('mousemove', this.handleMouseMove)
      document.removeEventListener('mouseup', this.handleMouseEnd)
      if (e.cancelable) {
        e.preventDefault()
      }
    },
    handleMouseMove(e) {
      this.setProgress(e)
    },
    // set slider progress
    setProgress(e) {
      if (!this.isSliderSeekable) {
        return
      }
      const el = this.sliderRef
      const max = this.audioDuration
      let value = ((e.clientX - el.getBoundingClientRect().left) / el.offsetWidth) * max
      value = Math.round(value)
      if (value > max) {
        value = max
      } else if (value < 0) {
        value = 0
      }
      this.audioProgress = value
    },
    // audio player
    // https://html.spec.whatwg.org/multipage/media.html#the-audio-element
    applyAudioProgress() {
      try {
        this.audio.currentTime = this.audioProgress
      } catch (ignore) {
        /** audio seek failed */
        this.audioProgress = this.audio.currentTime
      }
      this.isSeeking = false
    },
    syncAudioSeekable() {
      let seekable = this.audio.seekable
      this.isAudioSeekable = !_.isNil(seekable) && seekable.length > 0
    },
    syncAudioPaused(defaultValue) {
      this.isPaused = !!_.defaultTo(this.audio.paused, defaultValue)
    },
    syncAudioEnded() {
      this.isAudioEnded = _.defaultTo(this.audio.ended, true)
    },
    checkIsProgressEnded() {
      return this.audioDuration > 0 && this.audioProgress >= this.audioDuration
    },
    startAudioWaitingChecker() {
      // show loading when audio waiting too long
      // use timer because audio events may not fired in some system
      let state = []
      let timer = setInterval(() => {
        let isWaiting = false
        if (!this.isPaused && !this.checkIsProgressEnded()) {
          state.push(this.audioProgress)
          while (state.length > 2) {
            state.splice(0, 1)
          }
          if (state.length === 2 && state[0] === state[1]) {
            isWaiting = true
          }
        }
        this.isAudioWaiting = isWaiting
      }, 3000)
      return timer
    },
    initAudio() {
      let audio = new Audio(this.src)
      this.audio = audio
      audio.preload = 'metadata'
      audio.muted = false
      this.syncAudioSeekable()
      this.audioChecker = this.startAudioWaitingChecker()
      audio.addEventListener('durationchange', this.handleAudioDuration)
      audio.addEventListener('timeupdate', this.handleAudioProgress)
      audio.addEventListener('progress', this.handleAudioBuffer)
      audio.addEventListener('playing', this.handleAudioPlaying)
      audio.addEventListener('canplay', this.handleAudioCanPlay)
      audio.addEventListener('loadedmetadata', this.handleAudioLoaded)
      audio.addEventListener('loadeddata', this.handleAudioLoaded)
      audio.addEventListener('play', this.handleAudioPlay)
      audio.addEventListener('pause', this.handleAudioPause)
      audio.addEventListener('ended', this.handleAudioEnded)
      audio.addEventListener('emptied', this.handleAudioEmptied)
      audio.addEventListener('error', this.handleAudioError)
    },
    destroyAudio() {
      let audio = this.audio
      if (_.isNil(audio)) {
        return
      }
      if (!_.isNil(this.audioChecker)) {
        clearInterval(this.audioChecker)
        this.audioChecker = null
      }
      audio.removeEventListener('durationchange', this.handleAudioDuration)
      audio.removeEventListener('timeupdate', this.handleAudioProgress)
      audio.removeEventListener('progress', this.handleAudioBuffer)
      audio.removeEventListener('playing', this.handleAudioPlaying)
      audio.removeEventListener('canplay', this.handleAudioCanPlay)
      audio.removeEventListener('loadedmetadata', this.handleAudioLoaded)
      audio.removeEventListener('loadeddata', this.handleAudioLoaded)
      audio.removeEventListener('play', this.handleAudioPlay)
      audio.removeEventListener('pause', this.handleAudioPause)
      audio.removeEventListener('ended', this.handleAudioEnded)
      audio.removeEventListener('emptied', this.handleAudioEmptied)
      audio.removeEventListener('error', this.handleAudioError)
      // ensure release audio resource
      audio.src = ''
      if (_.isFunction(audio.load)) {
        audio.load()
      }
      this.audio = null
    },
    // audio events
    handleAudioDuration(e) {
      let duration = this.audio.duration
      if (!_.isFinite(duration) || _.isNaN(duration)) {
        duration = -1
      }
      this.audioDuration = duration
      this.isAudioReady = true
      this.syncAudioSeekable()
    },
    handleAudioProgress(e) {
      if (!this.isSeeking) {
        this.audioProgress = this.audio.currentTime
        // the ended event may not fired
        if (this.checkIsProgressEnded()) {
          this.handleAudioEnded(e)
        }
      }
    },
    handleAudioBuffer(e) {
      let buffer = this.audio.buffered
      if (!_.isNil(buffer) && buffer.length > 0) {
        this.audioBuffer = buffer.end(0)
      }
    },
    handleAudioPlaying(e) {
      this.isAudioWaiting = false
      this.syncAudioSeekable()
    },
    handleAudioCanPlay(e) {
      this.isAudioWaiting = false
      this.syncAudioSeekable()
    },
    handleAudioLoaded(e) {
      this.syncAudioSeekable()
    },
    handleAudioPlay() {
      // handle audio play by system widget
      if (this.isPaused) {
        this.syncAudioPaused(false)
      }
      this.syncAudioSeekable()
    },
    handleAudioPause() {
      // handle audio pause by system widget
      if (!this.isPaused) {
        this.syncAudioPaused(true)
      }
      this.syncAudioSeekable()
    },
    handleAudioEnded(e) {
      this.syncAudioEnded()
      this.syncAudioPaused(true)
      this.syncAudioSeekable()
    },
    handleAudioEmptied(e) {
      this.syncAudioPaused(true)
      this.syncAudioSeekable()
    },
    handleAudioError(e) {
      if (!_.isNil(this.audio.error)) {
        this.audioError = '音频无法播放'
        // eslint-disable-next-line no-console
        console.error(this.audio.error)
      }
      this.syncAudioPaused(true)
      this.syncAudioSeekable()
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.audio-player {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 0 2 * @pr 0 darken(@antLineGrey, 10%);
  border-radius: 4 * @pr;
  margin-bottom: 16 * @pr;
}

.audio-button-play {
  width: 48 * @pr;
  height: 48 * @pr;
  font-size: 32 * @pr;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.audio-main {
  position: relative;
  top: -1 * @pr;
  flex: 1;
  padding-right: 6 * @pr;
}

.audio-slider {
  width: 100%;
  position: relative;
  height: 24 * @pr;
  display: flex;
  align-items: center;
  user-select: none;
  outline: none;
  cursor: default;
}

.audio-slider.audio-slider-seekable {
  cursor: pointer;
}

.audio-slider-progress,
.audio-slider-buffer,
.audio-slider-track {
  position: absolute;
  height: 2 * @pr;
  left: 0;
  top: 50%;
  margin-top: -1 * @pr;
  z-index: 1;
}

.audio-slider-progress {
  background-color: @antTextBlack;
}

.audio-slider-buffer {
  background-color: lighten(@antTextLight, 10%);
}

.audio-slider-track {
  width: 100%;
  background-color: @antLineGrey;
}

.audio-time {
  display: flex;
  justify-content: space-between;
  color: @antTextGrey;
  font-size: 12 * @pr;
  line-height: 18 * @pr;
  margin-top: -8 * @pr;
  font-weight: lighter;
  cursor: default;
}

.audio-time-now {
  margin-right: 6 * @pr;
}

.audio-time-duration {
  flex: 1;
  text-align: right;
}

.audio-loading {
  display: flex;
  height: 18 * @pr;
  align-items: center;
}

.audio-loading svg {
  width: 12 * @pr;
  height: 12 * @pr;
  animation: rotate 1.4s linear infinite;
  position: relative;
}

@keyframes rotate {
  to {
    transform: rotate(1turn);
  }
}
</style>
