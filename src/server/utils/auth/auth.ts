import { hash, verify } from "@node-rs/argon2";

const argon2Options = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
}

export async function $verifyPassword(password: string, hash: string): Promise<boolean> {
    return await verify(hash, password, argon2Options);
}

export async function $hashPassword(password: string): Promise<string> {
    return await hash(password, argon2Options);
}