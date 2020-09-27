const publicPath = process.env.BASE_URL
const version = '2.7.8'

function initMathjax() {
  if (!(window.MathJax === null || window.MathJax === undefined)) {
    return
  }
  window.MathJax = {
    AuthorInit: function() {
      // http://docs.mathjax.org/en/v2.7-latest/advanced/debugging-tips.html
      MathJax.Hub.Register.MessageHook('Math Processing Error', function(message) {
        // do something with the error. message[2] is the Error object that records the problem.
        let error = message[2]
        // eslint-disable-next-line no-console
        console.error(error)
      })
      // https://docs.mathjax.org/en/v2.7-latest/advanced/startup.html
      MathJax.Hub.Register.StartupHook('End', function() {
        let renderTask = window._MathJaxStoryRender
        window._MathJaxStoryRender = null
        if (renderTask !== null && renderTask !== undefined) {
          renderTask()
        }
      })
    },
    // https://docs.mathjax.org/en/v2.4-latest/misc/faq.html#the-mathjax-font-folder-is-too-big-is-there-any-way-to-compress-it
    imageFont: null,
    messageStyle: 'none',
    skipStartupTypeset: true,
    elements: ['do-not-auto-render-any-elements'],
    tex2jax: {
      inlineMath: [
        ['$', '$'],
        ['\\(', '\\)'],
      ],
      processEscapes: true,
    },
    // Fix: Uncaught TypeError: Cannot read property 'firstChild' of null
    // https://github.com/mathjax/MathJax/issues/2157
    'fast-preview': { disabled: true },
  }
  var script = document.createElement('script')
  script.type = 'text/javascript'
  // http://docs.mathjax.org/en/v2.7-latest/config-files.html
  script.src = `${publicPath}libs/MathJax-${version}/MathJax.js?config=TeX-MML-AM_HTMLorMML,Safe`
  document.getElementsByTagName('head')[0].appendChild(script)
}

export default initMathjax
