import busboy from "busboy";
import internal from "stream";
import { ThumbnailOptions } from "../../lib/fileHandling/thumbnailOptions";
import $handleFileUpload from "../fileHandling/handleFileUpload";

/** function that will parseForm to fields */
export default async function $processFormData<T extends ProcessedFormData>(options: ProcessFormDataOptions) {
    let data = {} as T;
    let attachments = new Map<string, string>();

    return {
        processFields: (name: string, value: string) =>
            handleFields(name, value, options, data),
        processFiles: async (name: string, stream: internal.Readable & { truncated?: boolean }, info: busboy.FileInfo, disableStreamResume: boolean = false) =>
            await processFiles(name, stream, info, disableStreamResume, options, data, attachments),
        /** left the implementation to the user,
         *  since JSON fields are complex, and searching everything inside can be bad when we know where to search */
        attachments,
        data,
    };
}

function handleFields(
    name: string,
    value: string,
    options: ProcessFormDataOptions,
    data: ProcessedFormData,
) {
    for (let fieldName in options) {
        if (typeof options[fieldName] === "object") continue
        if (name === fieldName) {
            const isJSON = options[fieldName] === "JSON"
            data[fieldName as keyof ProcessedFormData] = isJSON ? JSON.parse(value) : value === "null" ? null : value;
            return
        }
    }
}

async function processFiles(
    name: string,
    stream: internal.Readable & { truncated?: boolean },
    info: busboy.FileInfo,
    disableStreamResume: Boolean,
    options: ProcessFormDataOptions,
    data: ProcessedFormData,
    attachments: Map<string, string>,
) {
    // problem in this?? the attachment not working
    for (let fieldName in options) {
        if (typeof options[fieldName] !== "object") continue
        const { dir, thumbnailOptions, aliases, attachTo } = options[fieldName];

        if (name === fieldName ||
            aliases?.includes(name) ||
            attachTo && (name.startsWith(fieldName) || aliases?.some(alias => name.startsWith(alias)))
        ) {
            const filePath = $handleFileUpload(stream, dir, {
                thumbnails: thumbnailOptions,
                fileName: info.filename
            })

            return attachTo
                ? attachments.set(name, filePath)
                : data[fieldName] = filePath
        }
    }

    if (!disableStreamResume)
        stream.resume()
}

type FieldName = string;

type File = {
    dir: string;
    thumbnailOptions: ThumbnailOptions[];
    /** attach to a JSON field in the key(s) with the name of this key even if nested  */
    attachTo?: string
    /** accept fields with name of: */
    aliases?: string[];
}

export interface ProcessFormDataOptions {
    /** Default is String */
    [key: FieldName]: File | "JSON" | "String";
}

export interface ProcessedFormData { [key: string]: object | string | boolean | null }