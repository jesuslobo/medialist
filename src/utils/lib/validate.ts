// This file contains exposed validators to user functions that validate user input.

export const validatePassword = (password: string) => typeof password === "string" && password.length >= 6;
export const validateUsername = (username: string) => typeof username === "string" && username.length >= 3 && username.length <= 40;