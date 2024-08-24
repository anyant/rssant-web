export function downloadFile(url, filename) {
  var link = document.createElement('a')
  link.href = url
  if (filename) {
    link.download = filename
  }
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
