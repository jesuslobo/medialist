import { customAlphabet } from 'nanoid'

export const generateID = (length: number = 10) => {
  const idGenerator = customAlphabet('123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz', length);
  return idGenerator();
}