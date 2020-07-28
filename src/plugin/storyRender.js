import _ from 'lodash'

// Example:
// https://liam.page/2019/06/28/variants-of-FM/
// http://matt33.com/2019/10/27/paper-chandy-lamport/

// Note: accept $...$ but not $10...$10
const RE_INLINE_MATHJAX = /(\$(?!\d)[^$]+?\$(?!\d))|(`[^`]+?`)/ms
const RE_DISPLAY_MATHJAX = /(\$\$[^$]+?\$\$)|(\\\([^()]+?\\\))|(\\\[[^[]]+?\\\])/ms

const StoryRender = {
  install(Vue) {
    function renderDom(content) {
      let dom = document.createElement('div')
      dom.innerHTML = content
      return dom
    }

    function hasMathJax(content) {
      let hasInlineMathjax = RE_INLINE_MATHJAX.test(content)
      let hasDisplayMathjax = RE_DISPLAY_MATHJAX.test(content)
      return hasInlineMathjax || hasDisplayMathjax
    }

    function renderMathjax(dom) {
      // http://docs.mathjax.org/en/v2.7-latest/advanced/typeset.html#reset-automatic-equation-numbering
      MathJax.Hub.Queue(
        ['resetEquationNumbers', MathJax.InputJax.TeX],
        ['PreProcess', MathJax.Hub],
        ['Reprocess', MathJax.Hub]
      )
      dom.querySelectorAll('code,pre').forEach(block => {
        const text = block.innerHTML
        let hasInlineMathjax = RE_INLINE_MATHJAX.test(text)
        let hasDisplayMathjax = RE_DISPLAY_MATHJAX.test(text)
        if (hasInlineMathjax || hasDisplayMathjax) {
          if (hasInlineMathjax) {
            block.outerHTML = '<span class="story-render-mathjax">' + text + '</span>'
          } else {
            block.outerHTML = '<p class="story-render-mathjax">' + text + '</p>'
          }
        }
      })
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, dom])
    }

    function isMathjaxReady() {
      return !_.isNil(window.MathJax) && !_.isNil(window.MathJax.Hub)
    }

    function renderMathjaxIfReady(dom) {
      if (isMathjaxReady()) {
        renderMathjax(dom)
      } else {
        // TODO: render MathJax after it's ready
      }
    }

    Vue.directive('story', function(el, binding) {
      let content = binding.value || ''
      let dom = renderDom(content)
      el.innerHTML = ''
      el.appendChild(dom)
      if (hasMathJax(content)) {
        renderMathjaxIfReady(dom)
      }
    })
  },
}

export default StoryRender
