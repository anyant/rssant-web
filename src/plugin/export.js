import { blobErrorMessage, downloadBlob } from './download'

export async function confirmAndDownload({ vm, title, message, request, filename }) {
  const { result } = await vm.$confirm(message, title)
  if (!result) {
    return
  }
  vm.$toast.info('正在打包，请稍等…')
  try {
    const blob = await request()
    downloadBlob(blob, filename())
    vm.$toast.success('导出完成')
  } catch (error) {
    const errorMessage = await blobErrorMessage(error)
    vm.$toast.error({ message: errorMessage, time: 10000 })
  }
}
