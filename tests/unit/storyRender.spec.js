import { expect } from 'chai'
import { hasInlineMathJax, hasDisplayMathJax, hasMathJax } from '@/plugin/storyRender'

describe('plugin/storyRender', () => {
  it('test hasInlineMathJax', () => {
    let has_mathjax_cases = [
      '$x^{y^z}=(1+{\\rm e}^x)^{-2xy^w}$',
      '$f(x,y,z) = 3y^2z \\left( 3+\\frac{7x+5}{1+y^2} \\right)$',
      '$1 \\over 3$',
      '$\\vec{a} \\cdot \\vec{b}=0$',
    ]
    let not_mathjax_cases = [
      '$10 aaa $10  $10 aaa $10',
      '$10 $10  $10 $10',
      '$10.0',
      '100$ 100$',
      'console.log($.fn.jquery); window.$;',
      '$ === jQuery; typeof($);',
      "$('p,div'); $('p.red,p.green');",
    ]
    has_mathjax_cases.forEach(text => {
      expect(hasInlineMathJax(text)).to.equal(true, text)
    })
    not_mathjax_cases.forEach(text => {
      expect(hasInlineMathJax(text)).to.equal(false, text)
    })
  })

  it('test hasDisplayMathJax', () => {
    let text = `
        $$ f(x)=\\left\\{
        \\begin{aligned}
        x & = & \\cos(t) \\\\
        y & = & \\sin(t) \\\\
        z & = & \\frac xy
        \\end{aligned}
        \\right.
        $$
    `
    for (let i = 0; i < 3; i++) {
      expect(hasDisplayMathJax(text)).to.equal(true)
    }
  })

  it('test hasMathJax', () => {
    let trueCases = [
      `$x^{y^z}=(1+{\\rm e}^x)^{-2xy^w}$`,
      `<p>这里 $n$ 是特征`,
      `向量 $\vec x$ 的长度，即特征的维数。`,
      `<code>$v_i$</code> 是长度`,
      `为 $k$ 的向量，与特征 id 对应，称为特征的隐向量。`,
    ]
    trueCases.forEach(text => {
      expect(hasMathJax(text)).to.equal(true)
    })
    let falseText = `The model of subscription premium audio content is popular in China,
        where Ximalaya, a unicorn consumer audio platform, has a subscription
        feature for $3 monthly that enables users to access over 4000 e-books
        and over 300 premium audio courses or podcasts. Audio content is also
        available a la carte starting at $0.03 per short, serialized book chapter,
        or anywhere from $10 to $45 for paid audio courses.`
    for (let i = 0; i < 3; i++) {
      expect(hasMathJax(falseText)).to.equal(false)
    }
  })
})
