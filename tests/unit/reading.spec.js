import { expect } from 'chai'
import { normalizeReadingFontSize, READING_FONT_SIZES } from '@/plugin/reading'

describe('plugin/reading', () => {
  it('支持四档字号', () => {
    expect(READING_FONT_SIZES).to.deep.equal([13, 15, 17, 20])
    READING_FONT_SIZES.forEach(size => {
      expect(normalizeReadingFontSize(size)).to.equal(size)
    })
  })

  it('字符串数字按数字处理', () => {
    expect(normalizeReadingFontSize('17')).to.equal(17)
  })

  it('没设置过的值和非法值都回落默认 15', () => {
    let invalidValues = [undefined, null, NaN, '', 'abc', 0, 14, 16, 99, -15]
    invalidValues.forEach(value => {
      expect(normalizeReadingFontSize(value)).to.equal(15)
    })
  })
})
