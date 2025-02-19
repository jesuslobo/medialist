export const shortIdRegex = /^[123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz]{14}$/
export const validateShortID = (id: unknown) => typeof id === 'string' && shortIdRegex.test(id)

export const longIdRegex = /^[123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz]{20}$/
export const validateLongID = (id: unknown) => typeof id === 'string' && longIdRegex.test(id)