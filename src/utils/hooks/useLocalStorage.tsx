import { Dispatch, SetStateAction, useState } from "react"

export default function useLocalStorage<T>(key: string, fallbackValue?: T) {
    const [state, setState] = useState(() => {
        if (!window) return null

        const value = window.localStorage.getItem(key)
        return value ? JSON.parse(value) : fallbackValue
    })

    const setValue = (value: T) => {
        if (!window) return

        window.localStorage.setItem(key, JSON.stringify(value))
        setState(value)
    }

    return [state, setValue] as [T, Dispatch<SetStateAction<T>>]
}