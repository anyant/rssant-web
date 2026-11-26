import { blobErrorMessage, downloadBlob } from './download'

export async function confirmAndDownload({
  vm,
  title,
  message,
  request,
  filename,
  pendingMessage = '正在打包，请稍等…',
  setBusy,
}) {
  if (setBusy) {
    setBusy(true)
  }
  let confirmed = false
  try {
    const { result } = await vm.$confirm(message, title, { okLabel: '导出' })
    confirmed = result
  } finally {
    if (!confirmed && setBusy) {
      setBusy(false)
    }
  }
  if (!confirmed) {
    return
  }
  vm.$toast.info(pendingMessage)
  try {
    const blob = await request()
    downloadBlob(blob, filename())
    vm.$toast.success('导出完成')
  } catch (error) {
    const errorMessage = await blobErrorMessage(error)
    vm.$toast.error({ message: errorMessage, time: 10000 })
  } finally {
    if (setBusy) {
      setBusy(false)
    }
  }
}
