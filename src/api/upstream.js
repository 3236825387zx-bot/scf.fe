import { apiRequest } from './http'

export const fetchUpstreamOrders = (params) => apiRequest('/upstream-orders', { params })
export const dispatchUpstreamOrder = (orderId) => apiRequest(`/upstream-orders/${orderId}/dispatch`, { method: 'POST' })
