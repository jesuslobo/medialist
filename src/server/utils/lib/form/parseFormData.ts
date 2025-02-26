import { ThumbnailOptions } from "@/utils/lib/fileHandling/thumbnailOptions";
import busboy from "busboy";
import internal from "stream";
import $handleFileUpload from "../../file/handleFileUpload";

/** function that will parseForm to fields */
export default function $parseFormData<T extends ProcessedFormData>(
    builder: ProcessFormDataBuilder,
    bbConfig: busboy.BusboyConfig,
    callback: (data: T, attachments: Map<string, string>) => Promise<any>
) {
    let data = {} as T;
    let attachments = new Map<string, string>();
    const promises = [] as Promise<any>[];

    const bb = busboy(bbConfig)
    bb.on('field', (name, value) => processField(name, value, builder, data))
    bb.on('file', (name, stream, info) => processFiles(name, stream, info, false, builder, data, attachments, promises))

    bb.on('finish', async () => {
        await Promise.all(promises)
        await callback(data, attachments)
    })

    return bb
}

function processField(
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
    promises: Promise<any>[],
) {
    for (let fieldName in options) {
        if (typeof options[fieldName] !== "object") continue
        const { dir, thumbnailOptions, aliases, attachTo } = options[fieldName];

        if (name === fieldName ||
            aliases?.includes(name) ||
            attachTo && (name.startsWith(fieldName) || aliases?.some(alias => name.startsWith(alias)))
        ) {
            const [fileName, filePromises] = $handleFileUpload(stream, dir, {
                thumbnails: thumbnailOptions,
                mimeType: info.mimeType,
                fileName: info.filename,
            })
            promises.push(...filePromises)

            return attachTo
                ? attachments.set(name, fileName)
                : data[fieldName] = fileName
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