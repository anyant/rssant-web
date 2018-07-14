import * as lodash from 'lodash-es'

const Timeit = function() {}

Timeit.show = function(time, url) {
  time = time.substring(0, time.length - 2)
  time = lodash.round(lodash.toNumber(time))
  let color = '#4caf50' // green500
  if (time > 50) {
    color = '#f44336' // red500
  } else if (time > 30) {
    color = '#ff9800' // orange500
  }
  let parent = document.querySelector('#timeit')
  let element = document.createElement('div')
  element.style.color = color
  element.innerHTML = `
    <span style="min-width:45px; display:inline-block; text-align:right;">
      ${time}ms
    </span>
    <span>${url}</span>
  `
  parent.appendChild(element)
  setTimeout(() => {
    parent.removeChild(element)
  }, 10000)
}

export default Timeit
