import { Button } from "@heroui/react"
import { AnimatePresence, motion, Variants } from "framer-motion"
import { useState } from "react"

export default function ItemPageDescription({
    description,
    className,
    height,
}: {
    description?: string
    className?: string
    height?: number
}){
    const [isOpen, setIsOpen] = useState(false)
    const toggleDescription = () => setIsOpen(!isOpen)

    const variants: Variants = {
        open: {
            height: "auto",
            transition: {
                type: "spring",
                bounce: 0,
                duration: 0.30,
            },
        },
        closed: {
            height: height || 100,
            transition: {
                type: "spring",
                bounce: 0,
                duration: 0.30
            },
        }
    }

    return description && (
        <AnimatePresence>
            <div className={'flex flex-col justify-center w-full' + className}>
                <motion.div
                    className='overflow-hidden w-full md:text-sm whitespace-pre-wrap'
                    initial={false}
                    animate={isOpen ? "open" : "closed"}
                    // transition={{ duration: 0.5 }}
                    variants={variants}
                >
                    {description}
                </motion.div>

                <Button
                    className='w-full border-pure-opposite bg-transparent duration-100 hover:bg-pure-opposite/10 rounded-xl'
                    size='sm'
                    onPress={toggleDescription}
                >
                    {isOpen ? 'Show Less' : 'Show More'}
                </Button>
            </div>
        </AnimatePresence>
    )
};