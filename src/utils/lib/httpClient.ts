/** @param host Set host For External Sites */
export default function httpClient(host: string = '/api') {

    const stringifyObjects = (data?: FormData | object | object[],) => {
        if (!data) return
        const isFormData = typeof data === 'object' && data instanceof FormData
        return isFormData ? data : JSON.stringify(data)
    }

    const apiFactory: ApiFactory = async (method, path, data, requestInit) => {
        const body = stringifyObjects(data);
        const res = await fetchFn(host, path, { method, body, ...requestInit });
        return await res.json();
    };

    async function get(path?: string, requestInit?: RequestInit) {
        const res = await fetchFn(host, path, { cache: 'no-store', ...requestInit })
        return await res.json()
    }

    // delete is a reserved keyword
    async function delete$(path?: string, data?: object | object[], requestInit?: RequestInit) {
        const res = await fetchFn(host, path, { method: 'DELETE', body: JSON.stringify(data), ...requestInit })
        return await res.json()
    }

    const post: ApiMethod = async (...props) => await apiFactory('POST', ...props)
    const put: ApiMethod = async (...props) => await apiFactory('PUT', ...props)
    const patch: ApiMethod = async (...props) => await apiFactory('PATCH', ...props)

    return ({
        get,
        delete: delete$,
        post,
        put,
        patch,
    })

}

type ApiFactory = (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path?: string,
    data?: FormData | object | object[],
    requestInit?: RequestInit,
) => Promise<any>;

type ApiMethod = (
    path?: string,
    data?: FormData | object | object[],
    requestInit?: RequestInit,) =>
    Promise<any>;

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