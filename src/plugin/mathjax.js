const publicPath = process.env.BASE_URL

function initMathjax() {
    window.MathJax = {
        AuthorInit: function () {
        },
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
