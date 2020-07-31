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
    },
    // https://docs.mathjax.org/en/v2.4-latest/misc/faq.html#the-mathjax-font-folder-is-too-big-is-there-any-way-to-compress-it
    imageFont: null,
    messageStyle: 'none',
    showMathMenu: false,
    showMathMenuMSIE: false,
    skipStartupTypeset: true,
    elements: ['do-not-auto-render-any-elements'],
    tex2jax: {
      inlineMath: [
        ['$', '$'],
        ['\\(', '\\)'],
      ],
      processEscapes: true,
    },
  }
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = `${publicPath}libs/MathJax-${version}/MathJax.js?config=TeX-AMS-MML_HTMLorMML,Safe`
  document.getElementsByTagName('head')[0].appendChild(script)
}

export default initMathjax
