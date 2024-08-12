import { validImagesMIME } from "@/utils/lib/fileHandling/validImages";
import { Button } from "@nextui-org/react";
import { DetailedHTMLProps, HTMLAttributes, useRef, useState } from "react";
import { BiX } from "react-icons/bi";
import { twMerge } from "tailwind-merge";

type DivAttributes = Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onDrop' | 'onDragOver' | 'onDragLeave' | 'onClick' | 'onChange' | 'children'>

interface ImageInputProps extends DivAttributes {
    value: File | null
    onChange: (value: File | null) => void
    children?: ({ error }: { error: string | null }) => JSX.Element
    /** Will Over Ride Types Validation:
     * default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/jpg', 'image/bmp', 'image/tiff']
     */
    overRideTypes?: string[]
    /**
     * Extra Valid Types to be added to the default types
     * the default types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/jpg', 'image/bmp', 'image/tiff']
     */
    extraValidTypes?: string[]
}

export default function ImageInput({
    children,
    className,
    value,
    onChange,
    extraValidTypes,
    overRideTypes = validImagesMIME,
    ...props
}: ImageInputProps) {
    const ref = useRef<HTMLDivElement>(null)
    const fileInput = useRef<HTMLInputElement>(null)

    const [image, setImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const validTypes = extraValidTypes ? overRideTypes.concat(extraValidTypes) : overRideTypes

    function loadImage(file: File) {
        const fileType = file.type
        if (!validTypes.includes(fileType)) {
            setError(`Invalid File Type ${fileType.split('/')[1] || ''}`)
            return null
        }

        setError(null)
        const fileReader = new FileReader()
        fileReader.onload = () => setImage(fileReader.result as string)
        fileReader.readAsDataURL(file)

        onChange(file)
        return file
    }

    function onDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
        ref.current?.classList.add('bg-default')
    }

    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
        ref.current?.classList.remove('bg-default')

        const file = e.dataTransfer.files[0]
        value = loadImage(file)
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e?.target?.files?.[0]
        if (!file) return
        value = loadImage(file)
    }

    return (
        <div
            {...props}
            ref={ref}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={() => ref.current?.classList.remove('bg-default')}
            onClick={() => fileInput.current?.click()}
            className={twMerge(
                "relative bg-accented text-foreground overflow-hidden border-accented border-8 hover:border-default hover:bg-default rounded-xl hover:cursor-pointer duration-300",
                error && 'border-danger hover:border-danger-600',
                className,
            )}
        >
            <input
                ref={fileInput}
                type="file"
                accept={validTypes.join(', ')}
                onChange={onInputChange}
                hidden
            />

            <div className="flex justify-center items-center w-full h-full z-10  rounded-lg bg-transparent duration-300 hover:bg-default overflow-hidden">
                {children?.({ error }) ||
                    error && (
                        <div className="text-danger text-center p-3 space-y-3">
                            {error}
                            <br /> Allowed Types: {validTypes.map(type => type.split('/')[1]).join(', ')}
                        </div>
                    ) ||
                    <div className="text-center p-3">Drag Image or Click to Upload</div>

                }
            </div>

            {image && <>
                {/*  eslint-disable-next-line @next/next/no-img-element*/}
                <img src={image} alt="image" className="absolute rounded-lg top-0 left-0 w-full h-full object-cover z-0" />
                <Button
                    className="absolute bottom-2 right-2 z-20"
                    onPress={() => {
                        setImage(null)
                        onChange(null)
                        value = null
                    }}
                    isIconOnly
                >
                    <BiX size={30} />
                </Button>
            </>}

        </div>
    )

}