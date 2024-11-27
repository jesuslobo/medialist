import sharp from "sharp"

export const $webpTransformer = (w?: number, h?: number) => sharp()
    .resize(w, h)
    .webp()
    .on('error', error => {
        throw new Error(`Failed to convert image: ${error}`)
    })
