import { customAlphabet } from 'nanoid'

export const generateID = (length: number = 10) => {
  const idGenerator = customAlphabet('123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz', length);
  return idGenerator();
}

export const validatedID = (id: unknown) => typeof id === 'string' && /^[123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz]{10}$/.test(id)