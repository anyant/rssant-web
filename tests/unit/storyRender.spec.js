import { expect } from 'chai'
import { hasInlineMathJax, hasInlineCodeMathJax, hasDisplayMathJax, hasMathJax } from '@/plugin/storyRender'

describe('plugin/storyRender', () => {
  let trueInlineCases = [
    '$x^{y^z}=(1+{\\rm e}^x)^{-2xy^w}$',
    '$f(x,y,z) = 3y^2z \\left( 3+\\frac{7x+5}{1+y^2} \\right)$',
    '$1 \\over 3$',
    '$\\vec{a} \\cdot \\vec{b}=0$',
    '\\(\\sqrt[n]{3}\\)',
    '$\\sqrt[n]{3}$',
  ]
  let falseInlineCases = [
    '$10 aaa $10  $10 aaa $10',
    '$10 $10  $10 $10',
    '$10.0',
    '100$ 100$',
    'console.log($.fn.jquery); window.$;',
    '$ === jQuery; typeof($);',
    "$('p,div'); $('p.red,p.green');",
  ]
  let asciiMathCases = [
    '`sum_(i=1)^n i^3=((n(n+1))/2)^2`',
    '`hello world`',
    "echo `date '--date=1 hour ago' +%Y-%m-%d-%H`",
  ]

  it('test hasInlineMathJax', () => {
    ;[...trueInlineCases, ...asciiMathCases].forEach(text => {
      expect(hasInlineMathJax(text)).to.equal(true, text)
    })
    falseInlineCases.forEach(text => {
      expect(hasInlineMathJax(text)).to.equal(false, text)
    })
  })

  it('test hasInlineCodeMathJax', () => {
    trueInlineCases.forEach(text => {
      expect(hasInlineCodeMathJax(text)).to.equal(true, text)
    })
    ;[...falseInlineCases, ...asciiMathCases].forEach(text => {
      expect(hasInlineCodeMathJax(text)).to.equal(false, text)
    })
  })

  it('test hasDisplayMathJax', () => {
    let trueCases = [
      `$$ f(x)=\\left\\{
       \\begin{aligned}
       x & = & \\cos(t) \\\\
       y & = & \\sin(t) \\\\
       z & = & \\frac xy
       \\end{aligned}
       \\right.
       $$`,
      `\\[\\sqrt[n]{3}\\]`,
      `$$\\sqrt[n]{3}$$`,
    ]
    trueCases.forEach(text => {
      expect(hasDisplayMathJax(text)).to.equal(true, text)
    })
    let falseCases = [
      `\\(x^{y^z}=(1+{\\rm e}^x)^{-2xy^w}\\)`,
      `$x^{y^z}=(1+{\\rm e}^x)^{-2xy^w}$`,
      `\\{x^{y^z}=(1+{\\rm e}^x)^{-2xy^w}\\}`,
    ]
    falseCases.forEach(text => {
      expect(hasDisplayMathJax(text)).to.equal(false, text)
    })
  })

  it('test hasMathJax', () => {
    let trueCases = [
      `$x^{y^z}=(1+{\\rm e}^x)^{-2xy^w}$`,
      `\\(f(x,y,z) = 3y^2z \\left( 3+\\frac{7x+5}{1+y^2} \\right)\\)`,
      'when `x < y` we have',
      `<p>这里 $n$ 是特征`,
      `向量 $\\vec x$ 的长度，即特征的维数。`,
      `<code>$v_i$</code> 是长度`,
      `为 $k$ 的向量，与特征 id 对应，称为特征的隐向量。`,
      `a dot product \\(s = w^Tx\\)`,
      `gradient on the image \\(x\\) is simply \\(\\nabla_x s = w\\).`,
      `the gradient \\(\\nabla f(x)\\) is as fast of computing \\(f(x)\\).`,
    ]
    ;[...trueCases, ...asciiMathCases].forEach(text => {
      expect(hasMathJax(text)).to.equal(true, text)
    })
    let falseCases = [
      `the cost is $2.50 for the first one, and $2.00 for each additional one`,
      `The model of subscription premium audio content is popular in China,
       where Ximalaya, a unicorn consumer audio platform, has a subscription
       feature for $3 monthly that enables users to access over 4000 e-books
       and over 300 premium audio courses or podcasts. Audio content is also
       available a la carte starting at $0.03 per short, serialized book chapter,
       or anywhere from $10 to $45 for paid audio courses.`,
      '```hello world```',
      "echo $(date '--date=1 hour ago' +%Y-%m-%d-%H)",
    ]
    falseCases.forEach(text => {
      expect(hasMathJax(text)).to.equal(false, text)
    })
  })
})
