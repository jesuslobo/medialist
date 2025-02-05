import busboy from "busboy";
import internal from "stream";
import { ThumbnailOptions } from "../../../utils/lib/fileHandling/thumbnailOptions";
import $handleFileUpload from "../file/handleFileUpload";

/** function that will parseForm to fields */
export default function $processFormData<T extends ProcessedFormData>(builder: ProcessFormDataBuilder) {
    let data = {} as T;
    let attachments = new Map<string, string>();

    return {
        processFields: (name: string, value: string) =>
            handleFields(name, value, builder, data),
        processFiles: async (name: string, stream: internal.Readable & { truncated?: boolean }, info: busboy.FileInfo, disableStreamResume: boolean = false) =>
            await processFiles(name, stream, info, disableStreamResume, builder, data, attachments),
        /** left the implementation to the user,
         *  since JSON fields are complex, and searching everything inside can be bad when we know where to search */
        attachments,
        data,
    };
}

function handleFields(
    name: string,
    value: string,
    options: ProcessFormDataBuilder,
    data: ProcessedFormData,
) {
    for (let fieldName in options) {
        if (typeof options[fieldName] === "object" &&
            value === "null" &&
            (name === fieldName || options[fieldName].aliases?.includes(name))
        )
            return data[fieldName] = null;

        if (name === fieldName) {
            const type = options[fieldName]
            switch (type) {
                case "JSON":
                    data[fieldName] = JSON.parse(value); break;
                case "Boolean":
                    data[fieldName] = value === "true"; break;
                case "Number":
                    data[fieldName] = Number(value); break;
                default:
                    data[fieldName] = value === "null" ? null : value;
            }
            return
        }
    }
}

async function processFiles(
    name: string,
    stream: internal.Readable & { truncated?: boolean },
    info: busboy.FileInfo,
    disableStreamResume: Boolean,
    options: ProcessFormDataBuilder,
    data: ProcessedFormData,
    attachments: Map<string, string>,
) {
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

export interface ProcessFormDataBuilder {
    /** Default is String */
    [key: FieldName]: File | "JSON" | "String" | "Boolean" | "Number"
}

export interface ProcessedFormData { [key: string]: object | string | boolean | Number | null }