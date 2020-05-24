import lodash from 'lodash'

const Timeit = function() {}

Timeit.show = function(time, method, url) {
  let match = /^\d+/i.exec(time)
  let total_time = -1
  if (!lodash.isNil(match)) {
    total_time = lodash.round(lodash.toNumber(match[0]))
  }
  let color = '#4caf50' // green500
  if (total_time > 50) {
    color = '#f44336' // red500
  } else if (total_time > 30) {
    color = '#ff9800' // orange500
  }
  let parent = document.querySelector('#timeit')
  let element = document.createElement('div')
  element.style.color = color
  element.innerHTML = `
    <span style="min-width:45px; display:inline-block; text-align:right;">
      ${total_time}ms
    </span>
    <span>${method.toUpperCase()} ${url}</span>
  `
  parent.appendChild(element)
  setTimeout(() => {
    parent.removeChild(element)
  }, 10000)
}

export default Timeit
