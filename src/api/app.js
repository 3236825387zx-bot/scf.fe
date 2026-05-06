import { apiRequest } from './http'

const ensureObject = (value, message) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(message)
  }
  return value
}

const ensureArray = (value, message) => {
  if (!Array.isArray(value)) {
    throw new Error(message)
  }
  return value
}

const normalizeAuthUser = (payload, fallback = {}) => {
  const source =
    (payload && typeof payload === 'object' && !Array.isArray(payload) && (
      payload.user ||
      payload.userInfo ||
      payload.profile ||
      payload.account ||
      payload
    )) || {}

  const id = source.id || source.userId || source.uid || fallback.username || 'current-user'
  const name =
    source.name ||
    source.displayName ||
    source.nickname ||
    source.username ||
    fallback.name ||
    fallback.username ||
    '当前用户'
  const role = source.role || source.roleName || ''
  const username = source.username || fallback.username || String(id)

  return {
    ...source,
    id,
    name,
    role,
    username,
    roleCode: source.roleCode || ''
  }
}

export const fetchNavigation = async () => {
  const payload = await apiRequest('/app/navigation')
  const items = Array.isArray(payload) ? payload : payload?.items
  return ensureArray(items, '导航配置未返回有效数据')
}

export const fetchOmsWorkspace = async (params) => {
  const payload = await apiRequest('/oms/workspace', { params })
  const data = ensureObject(payload, 'OMS 工作台未返回有效数据')

  return {
    ...data,
    statusOptions: Array.isArray(data.statusOptions) ? data.statusOptions : [],
    logisticsProviders: Array.isArray(data.logisticsProviders) ? data.logisticsProviders : [],
    warehouseOptions: Array.isArray(data.warehouseOptions) ? data.warehouseOptions : [],
    orders: Array.isArray(data.orders) ? data.orders : []
  }
}

export const loginByPassword = async ({ username, password }) => {
  const payload = await apiRequest('/auth/login', {
    method: 'POST',
    body: { username, password }
  })

  return normalizeAuthUser(payload, { username })
}

export const registerByPassword = async ({ name, username, password, confirmPassword }) => {
  const payload = await apiRequest('/auth/register', {
    method: 'POST',
    body: { name, username, password, confirmPassword }
  })

  return normalizeAuthUser(payload, { name, username })
}
