import _ from 'lodash'

// Note: use strict regex to check MathJax, use loose regex to render
// LaTex '$' will conflict with money dollar, jQuery, shell/bash
// AsciiMath '`' will conflict with shell/bash

// Example:
// https://liam.page/2019/06/28/variants-of-FM/
// http://matt33.com/2019/10/27/paper-chandy-lamport/
// https://andrewchen.co/podcast-ecosystem-2019/
// http://karpathy.github.io/2015/03/30/breaking-convnets/
// https://timvieira.github.io/blog/post/2016/09/25/evaluating-fx-is-as-fast-as-fx/
// https://www.zybuluo.com/knight/note/96093

// see also: https://stackoverflow.com/questions/35142364/regex-negative-lookbehind-not-valid-in-javascript
// see also: https://caniuse.com/#feat=js-regexp-lookbehind
// see also: https://regexr.com/

const RE_STRICT_MATHJAX = /(\$\$.+?\$\$)|(\\\[.+?\\\])|(\\\(.+?\\\))/ms
const RE_INLINE_MATHJAX = /(\\\(.+?\\\))|(\$.+?\$(?![^\s<]))/ms
const RE_DISPLAY_MATHJAX = /(\$\$.+?\$\$)|(\\\[.+?\\\])/ms

function hasStrictMathJax(content) {
  return RE_STRICT_MATHJAX.test(content)
}

function hasInlineMathJax(content) {
  return RE_INLINE_MATHJAX.test(content)
}

function hasDisplayMathJax(content) {
  return RE_DISPLAY_MATHJAX.test(content)
}

function isMathjaxReady() {
  return !_.isNil(window.MathJax) && !_.isNil(window.MathJax.Hub)
}

export { hasInlineMathJax, hasDisplayMathJax, hasStrictMathJax }

// https://github.com/mathjax/mathjax-docs/wiki/'Can't-make-callback-from-given-data'-error-if-resetEquationNumbers-is-called-when-no-math-is-typeset
let isFirstMathJaxRender = true

const StoryRender = {
  install(Vue) {
    function renderMathjax(dom, elementId) {
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
      try {
        // http://docs.mathjax.org/en/v2.7-latest/advanced/typeset.html#reset-automatic-equation-numbering
        if (!isFirstMathJaxRender) {
          // use elementId instead of dom object can avoid errors
          MathJax.Hub.Queue(
            ['resetEquationNumbers', MathJax.InputJax.TeX, elementId],
            ['PreProcess', MathJax.Hub, elementId],
            ['Reprocess', MathJax.Hub, elementId]
          )
        }
        isFirstMathJaxRender = false
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, elementId])
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('MathJax ' + error)
      }
    }

    function renderMathjaxIfReady(dom, elementId) {
      if (isMathjaxReady() && !_.isEmpty(elementId)) {
        renderMathjax(dom, elementId)
      } else {
        // TODO: render MathJax after it's ready
      }
    }

    Vue.directive('story', function(el, binding) {
      if (binding.value === binding.oldValue) {
        return
      }
      let content = (binding.value || '').trim()
      el.innerHTML = content
      if (hasStrictMathJax(content)) {
        renderMathjaxIfReady(el, el.id)
      }
    })
  },
}

export default StoryRender
