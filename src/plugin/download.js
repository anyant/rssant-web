export function todayStamp() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return String(now.getFullYear()) + pad(now.getMonth() + 1) + pad(now.getDate())
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  downloadFile(url, filename)
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

export async function blobErrorMessage(error, fallback = '导出失败') {
  const data = error && error.response && error.response.data
  if (data instanceof Blob) {
    try {
      const text = await data.text()
      const payload = JSON.parse(text)
      return payload.message || payload.detail || fallback
    } catch (ex) {
      return fallback
    }
  }
  return (error && error.message) || fallback
}

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
