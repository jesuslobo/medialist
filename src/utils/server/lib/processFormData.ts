import busboy from "busboy";
import internal from "stream";
import { ThumbnailOptions } from "../../lib/fileHandling/thumbnailOptions";
import $handleFileUpload from "../fileHandling/handleFileUpload";

/** function that will parseForm to fields */
export default async function $processFormData<T extends ProcessedFormData>(options: ProcessFormDataOptions) {
    let data = {} as T;

    return {
        processFields: (name: string, value: string) =>
            handleFields(name, value, options, data),
        processFiles: async (name: string, stream: internal.Readable & { truncated?: boolean }, info: busboy.FileInfo, disableStreamResume?: boolean) =>
            await processFiles(name, stream, info, options.files, data, disableStreamResume),
        data,
    };
}

function handleFields(
    name: string,
    value: string,
    options: ProcessFormDataOptions,
    data: ProcessedFormData
) {
    for (let key in options.fields) {
        if (name === key)
            return data[key as keyof ProcessedFormData] = options.fields[key] === "JSON" ? JSON.parse(value) : value;
    }
    for (let key in options.files) {
        if (name === key || options.files[key]?.aliases?.includes(name))
            return data[key as keyof ProcessedFormData] = value === "null" ? null : value;
    }
}

async function processFiles(
    name: string,
    stream: internal.Readable & { truncated?: boolean },
    info: busboy.FileInfo,
    files: FilesOptions,
    data: ProcessedFormData,
    disableStreamResume?: Boolean
) {
    for (let key in files) {
        const { dir, thumbnailOptions } = files[key];
        if (name === key || files[key]?.aliases?.includes(name)) {
            return data[key] = $handleFileUpload(stream, dir, {
                thumbnails: thumbnailOptions,
                fileName: info.filename
            })
        }
    }

    if (!disableStreamResume)
        stream.resume()
}

type FieldName = string;

export interface ProcessFormDataOptions {
    fields: FieldsOptions;
    files: FilesOptions;
}

export interface ProcessedFormData { [key: string]: object | string | boolean | null }

interface FieldsOptions {
    [key: FieldName]: "JSON" | "String";
}

interface FilesOptions {
    [key: FieldName]: {
        dir: string;
        thumbnailOptions: ThumbnailOptions[];
        aliases?: string[];
    }
}