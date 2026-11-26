import Vue from 'vue'
import localConfig from './localConfig'

// 四档字号，默认 15 与现有正文样式一致
export const READING_FONT_SIZES = [13, 15, 17, 20]
export const DEFAULT_READING_FONT_SIZE = 15
// 标题比正文大 3px，原来正文 15px、标题 18px
export const READING_TITLE_OFFSET = 3

export function normalizeReadingFontSize(value) {
  let size = parseInt(value, 10)
  if (READING_FONT_SIZES.indexOf(size) === -1) {
    return DEFAULT_READING_FONT_SIZE
  }
  return size
}

const state = Vue.observable({
  fontSize: normalizeReadingFontSize(localConfig.READING_FONT_SIZE.get()),
})

// 阅读字体设置：只作用于文章正文和标题，不改页面根字号
export default {
  sizes: READING_FONT_SIZES,
  get fontSize() {
    return state.fontSize
  },
  setFontSize(value) {
    let size = normalizeReadingFontSize(value)
    state.fontSize = size
    localConfig.READING_FONT_SIZE.set(size)
  },
}
