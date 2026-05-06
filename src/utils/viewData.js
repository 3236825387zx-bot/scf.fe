export const ensureArray = (value) => (Array.isArray(value) ? value : [])

export const normalizeOptions = (options, { includeAll = false, allLabel = '全部' } = {}) => {
  const normalized = ensureArray(options).map((item) => {
    if (item && typeof item === 'object') {
      return {
        label: item.label ?? item.text ?? item.name ?? String(item.value ?? ''),
        value: item.value ?? item.code ?? item.id ?? item.label ?? ''
      }
    }

    return {
      label: String(item ?? ''),
      value: item ?? ''
    }
  })

  if (!includeAll) return normalized
  return [{ label: allLabel, value: '' }, ...normalized]
}

export const firstOptionValue = (options) => {
  const normalized = normalizeOptions(options)
  return normalized[0]?.value ?? ''
}

export const mergeFormWithDefaults = (baseForm, defaults) => ({
  ...baseForm,
  ...(defaults && typeof defaults === 'object' ? defaults : {})
})

export const resolveDisplayText = (value, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback
  return value
}
