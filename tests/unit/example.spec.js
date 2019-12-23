import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import Logo from '@/components/Logo.vue'

describe('Logo.vue', () => {
  it('renders RSSAnt when passed', () => {
    const msg = 'RSSAnt'
    const wrapper = shallowMount(Logo, {
      propsData: {}
    })
    expect(wrapper.text()).to.include(msg)
  })
})
