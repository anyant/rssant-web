const publicPath = process.env.BASE_URL

function initMathjax() {
    window.MathJax = {
        AuthorInit: function () {
            // http://docs.mathjax.org/en/v2.7-latest/advanced/debugging-tips.html
            MathJax.Hub.Register.MessageHook("Math Processing Error", function (message) {
                // do something with the error. message[2] is the Error object that records the problem.
                let error = message[2];
                console.error(error)
            });
        },
        messageStyle: 'none',
        showMathMenu: false,
        showMathMenuMSIE: false,
        elements: ['story-markdown-body'],
        tex2jax: {
            inlineMath: [['$', '$'], ["\\(", "\\)"]],
            processEscapes: true,
        },
    };
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `${publicPath}libs/mathjax/2.7.6/MathJax.js?config=TeX-AMS-MML_HTMLorMML,Safe`;
    document.getElementsByTagName("head")[0].appendChild(script);
}

export default initMathjax
