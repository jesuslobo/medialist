
/** @param host Set host For External Sites */
export default function httpClient(host: string = '/api') {

    async function get(path?: string, requestInit?: RequestInit) {
        const res = await fetchFn(host, path, { cache: 'no-store', ...requestInit })
        return await res.json()
    }

    async function post(path?: string, data?: FormData | object | object[], requestInit?: RequestInit) {
        const isFormData = typeof data === 'object' && data instanceof FormData
        const body = data ? (isFormData ? data : JSON.stringify(data)) : undefined

        const res = await fetchFn(host, path, { method: 'POST', body, ...requestInit })
        return await res.json()
    }

    async function put(path?: string, data?: FormData | object | object[], requestInit?: RequestInit) {
        const isFormData = typeof data === 'object' && data instanceof FormData
        const body = data ? (isFormData ? data : JSON.stringify(data)) : undefined

        const res = await fetchFn(host, path, { method: 'PUT', body, ...requestInit })
        return await res.json()
    }

    async function patch(path?: string, data?: object | object[], requestInit?: RequestInit) {
        const res = await fetchFn(host, path, { method: 'PATCH', body: JSON.stringify(data), ...requestInit })
        return await res.json()
    }

    // delete is a reserved keyword
    async function delete$(path?: string, data?: object | object[], requestInit?: RequestInit) {
        const res = await fetchFn(host, path, { method: 'DELETE', body: JSON.stringify(data), ...requestInit })
        return await res.json()
    }

    return ({
        get,
        post,
        put,
        patch,
        delete: delete$
    })

}

async function fetchFn(host: string, path: string | undefined, requestInit?: RequestInit) {
    try {
        const res = await fetch(`${host}/${path}`, {
            credentials: 'include',
            ...requestInit
        })
        const clone = res.clone() // Clone the response to check for errors, since res.json() consumes it
        const jsonRes = await res.json();

        if (!res.ok)
            throw new Error(jsonRes.message, { cause: jsonRes.cause })

        return clone

    } catch (e) {
        throw new Error((e as Error).message || 'Failed to Get Data', { cause: (e as Error).cause })
    }
}