import { ShopAntClient } from 'shopant-sdk'
import { REQUEST_ITERCEPTORS } from '@/plugin/api'

const shopantClient = ShopAntClient({ path: '/api/v1/shopant/integration' })
REQUEST_ITERCEPTORS.forEach(x => shopantClient.client.interceptors.request.use(x))

export default shopantClient
