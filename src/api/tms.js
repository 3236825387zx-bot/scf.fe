import { apiRequest } from './http'

export const fetchTmsCarrier = () => apiRequest('/tms/carriers')
export const fetchTmsTracking = (params) => apiRequest('/tms/tracking', { params })
export const fetchTmsReverse = () => apiRequest('/tms/reverse')
