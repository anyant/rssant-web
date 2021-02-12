import Vue from 'vue'
import _ from 'lodash'

// 主色
export const antGreen = '#66BB6A'
export const antBlue = '#60bbf3'
export const antGold = '#FFBA00'
export const antRed = '#f44336'
export const antInk = '#768fa1'

// 字体黑白灰
export const antTextBlack = '#000000' // 主内容
export const antTextSemi = '#353535' // 大段的主要内容
export const antTextGrey = '#888888' // 次要内容
export const antTextLight = '#B2B2B2' // 时间戳与表单缺省值
export const antTextWhite = '#FFFFFF' // 文字白

// 其他黑白灰
export const antBackWhite = '#FFFFFF' // 背景白
export const antRippleGrey = '#090909' // 涟漪黑
export const antBackGrey = '#FAFAFA' // 背景浅灰
export const antLineGrey = '#EAEAEA' // 线条浅灰

// 页面布局，注意和 common.less 保持一致
function computeLayout(windowInnerWidth) {
  const appWidth = Math.min(1500, windowInnerWidth)
  const hasBoard = appWidth >= 800
  const mainWidth = Math.max(320, Math.min(480, Math.round(appWidth / 2.618)))
  const boardWidth = appWidth - mainWidth
  return {
    windowInnerWidth: windowInnerWidth,
    appWidth: appWidth,
    hasBoard: hasBoard,
    mainWidth: hasBoard ? mainWidth : appWidth,
    boardWidth: hasBoard ? boardWidth : 0,
  }
}

const LAYOUT = Vue.observable({
  windowInnerHeight: window.innerHeight,
  ...computeLayout(window.innerWidth),
})
window.addEventListener(
  'resize',
  _.debounce(function() {
    let newWidth = window.innerWidth
    if (newWidth !== LAYOUT.windowInnerWidth) {
      let newLayout = computeLayout(newWidth)
      // reload routes after change layout
      if (newLayout.hasBoard !== LAYOUT.hasBoard) {
        window.location.reload()
      }
      _.forEach(_.entries(newLayout), ([key, value]) => {
        LAYOUT[key] = value
      })
    }
    let newHeight = window.innerHeight
    if (newHeight !== LAYOUT.windowInnerHeight) {
      LAYOUT.windowInnerHeight = newHeight
    }
  }),
  150
)
export const hasBoard = LAYOUT.hasBoard
export { LAYOUT }
