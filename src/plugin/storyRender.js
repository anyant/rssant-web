import _ from 'lodash'

// Example:
// https://liam.page/2019/06/28/variants-of-FM/
// http://matt33.com/2019/10/27/paper-chandy-lamport/

const RE_INLINE_MATHJAX = /(\$[^$]+?\$)|(`[^`]+?`)/ms
const RE_DISPLAY_MATHJAX = /(\$\$[^$]+?\$\$)|(\\\([^()]+?\\\))|(\\\[[^[]]+?\\\])/ms

const StoryRender = {
  install(Vue) {
    function renderDom(content) {
      let dom = document.createElement('div')
      dom.innerHTML = content
      return dom
    }

    function renderMathjax(dom, content) {
      let hasInlineMathjax = RE_INLINE_MATHJAX.exec(content)
      let hasDisplayMathjax = RE_DISPLAY_MATHJAX.exec(content)
      if (!(hasInlineMathjax || hasDisplayMathjax)) {
        return
      }
      // http://docs.mathjax.org/en/v2.7-latest/advanced/typeset.html#reset-automatic-equation-numbering
      MathJax.Hub.Queue(
        ['resetEquationNumbers', MathJax.InputJax.TeX],
        ['PreProcess', MathJax.Hub],
        ['Reprocess', MathJax.Hub]
      )
      dom.querySelectorAll('code,pre').forEach(block => {
        const text = block.innerHTML
        let hasInlineMathjax = RE_INLINE_MATHJAX.exec(text)
        let hasDisplayMathjax = RE_DISPLAY_MATHJAX.exec(text)
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

    Vue.directive('story', function(el, binding) {
      let content = binding.value || ''
      let dom = renderDom(content)
      el.innerHTML = ''
      el.appendChild(dom)
      let isMathjaxReady = !_.isNil(window.MathJax) && !_.isNil(window.MathJax.Hub)
      if (isMathjaxReady) {
        renderMathjax(dom, content)
      }
    })
  },
}

export default StoryRender
