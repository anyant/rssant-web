import _ from 'lodash'

// Example:
// https://liam.page/2019/06/28/variants-of-FM/
// http://matt33.com/2019/10/27/paper-chandy-lamport/
// https://andrewchen.co/podcast-ecosystem-2019/

// Note: accept $...$ but not $10...$10, 10$...10$ and jQuery $
// see also: https://stackoverflow.com/questions/35142364/regex-negative-lookbehind-not-valid-in-javascript
// see also: https://caniuse.com/#feat=js-regexp-lookbehind
// see also: https://regexr.com/
const RE_INLINE_DOLLAR = /([\d(.])?\$(?![(.])[^$]+?([(.])?\$(?![\d(.])/gms
const RE_INLINE_QUOTE = /`[^`]+?`/ms
const RE_DISPLAY_MATHJAX = /(\$\$[^$]+?\$\$)|(\\\([^()]+?\\\))|(\\\[[^[]]+?\\\])/ms

function hasInlineMathJax(content) {
  if (RE_INLINE_QUOTE.test(content)) {
    return true
  }
  // JavaScript RegExp objects are stateful when they have the global or sticky flags set
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
  let inlineDollar = new RegExp(RE_INLINE_DOLLAR)
  while (true) {
    let matcher = inlineDollar.exec(content)
    if (!matcher) {
      break
    }
    if (!matcher[1] && !matcher[2]) {
      return true
    }
  }
  return false
}

function hasDisplayMathJax(content) {
  return RE_DISPLAY_MATHJAX.test(content)
}

function hasMathJax(content) {
  return hasInlineMathJax(content) || hasDisplayMathJax(content)
}

function isMathjaxReady() {
  return !_.isNil(window.MathJax) && !_.isNil(window.MathJax.Hub)
}

export { hasInlineMathJax, hasDisplayMathJax, hasMathJax }

const StoryRender = {
  install(Vue) {
    function renderDom(content) {
      let dom = document.createElement('div')
      dom.innerHTML = content
      return dom
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
        let hasInline = hasInlineMathJax(text)
        let hasDisplay = hasDisplayMathJax(text)
        if (hasInline || hasDisplay) {
          if (hasInline) {
            block.outerHTML = '<span class="story-render-mathjax">' + text + '</span>'
          } else {
            block.outerHTML = '<p class="story-render-mathjax">' + text + '</p>'
          }
        }
      })
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, dom])
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
