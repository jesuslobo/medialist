import { Button, Popover, PopoverContent, PopoverProps, PopoverTrigger } from "@nextui-org/react";
import { useState } from "react";
import { BiTrashAlt, BiX } from "react-icons/bi";

interface TrashPopoverProps extends Omit<PopoverProps, 'children'> {
    onPress?: () => void;
    children: (props: { isTrashOpen?: boolean }) => JSX.Element;
}

export default function TrashPopoverButton({
    onPress,
    children,
    ...popoverProps
}: TrashPopoverProps) {
    const [isTrashOpen, setIsTrashOpen] = useState(false);

    return (
        <Popover
            {...popoverProps}
            showArrow={true}
            isOpen={isTrashOpen}
            onOpenChange={(open) => setIsTrashOpen(open)}
        >
            <PopoverTrigger>
                {children && children({ isTrashOpen })}
            </PopoverTrigger>
            <PopoverContent className="p-3">
                <p className="pb-3">Are you Sure?</p>
                <div className="flex items-center gap-x-2">
                    <Button
                        color="danger"
                        size="sm"
                        variant="bordered"
                        onPress={onPress}
                        isIconOnly
                    >
                        <BiTrashAlt className="text-2xl" />
                    </Button>
                    <Button
                        color="primary"
                        size="sm"
                        onPress={() => setIsTrashOpen(false)}
                        isIconOnly
                    >
                        <BiX className="text-2xl" />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
