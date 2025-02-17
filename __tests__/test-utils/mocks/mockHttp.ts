import Form from 'form-data';
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from 'node-mocks-http';
import { Readable } from "stream";

export default function $mockHttp(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>) {
    const apiFactory: ApiFactory = async (method, data, options) => {
        const isForm = typeof data === 'object' && data instanceof Form
        const res = httpMocks.createResponse<NextApiResponse>(isForm ? {
            eventEmitter: require('events').EventEmitter
        } : undefined);
        const req = httpMocks.createRequest<NextApiRequest>({ method, ...options });

        if (isForm) {
            req.headers = { ...req.headers, ...data.getHeaders() }

            const stream = new Readable()
            stream.push(data.getBuffer())
            stream.push(null)

            req.pipe = stream.pipe.bind(stream)
        } else {
            req.body = typeof data === 'object' ? JSON.stringify(data) : data
            req.headers['Content-Type'] = 'application/json'
        }
        await handler(req, res)

        if (isForm) {
            await new Promise((resolve) => {
                res.once('finish', resolve)
                res.once('error', resolve)
            })
        }

        return {
            res,
            req,
            body: res._getJSONData(),
            statusCode: res._getStatusCode(),
            headers: res._getHeaders()
        }
    };

    return ({
        get: (async (...props) => await apiFactory('GET', ...props)) as ApiMethod,
        delete: (async (...props) => await apiFactory('DELETE', ...props)) as ApiMethod,
        post: (async (...props) => await apiFactory('POST', ...props)) as ApiMethod,
        put: (async (...props) => await apiFactory('PUT', ...props)) as ApiMethod,
        patch: (async (...props) => await apiFactory('PATCH', ...props)) as ApiMethod,
    })
}

type ApiFactory = (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: Form | object | object[],
    options?: httpMocks.RequestOptions,
) => Promise<returnData>;

type ApiMethod = (
    data?: Form | object | object[],
    options?: httpMocks.RequestOptions,
) => Promise<returnData>;

interface returnData {
    res: httpMocks.MockResponse<NextApiResponse>,
    req: httpMocks.MockRequest<NextApiRequest>,
    body: any,
    statusCode: number,
    headers: object,
}