import { customAlphabet } from 'nanoid';

export const generateID = (length: number = 10) => {
  const idGenerator = customAlphabet('123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz', length);
  return idGenerator();
}

export const validatedID = (id: unknown) => typeof id === 'string' && /^[123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz]{10}$/.test(id)

export const shortIdRegex = /^[123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz]{14}$/
export const validateShortID = (id: unknown) => typeof id === 'string' && shortIdRegex.test(id)

export const longIdRegex = /^[123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz]{20}$/
export const validateLongID = (id: unknown) => typeof id === 'string' && longIdRegex.test(id)