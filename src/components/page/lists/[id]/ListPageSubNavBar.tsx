import { queryClient } from "@/components/providers/RootProviders";
import ToggleButton from "@/components/ui/buttons/ToggleButton";
import httpClient from "@/utils/lib/httpClient";
import { mutateItemCache } from "@/utils/lib/tanquery/itemsQuery";
import { badgeColors } from "@/utils/types/global";
import { ItemData } from "@/utils/types/item";
import { Button, ButtonProps, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useContext } from "react";
import { BiDotsVerticalRounded, BiPencil, BiPlus, BiPurchaseTag, BiRedo, BiRevision, BiTrash } from "react-icons/bi";
import { CiGrid2H } from "react-icons/ci";
import { FaDiamond } from "react-icons/fa6";
import { IoGridOutline } from "react-icons/io5";
import { LuDiamond } from "react-icons/lu";
import { ListPageContext } from "./ListPageProvider";

export default function ListPageSubNavBar() {
    const router = useRouter();
    const { list, viewMode, setViewMode, showTags, setShowTags, badgeableTags, tagsQuery, toggleTagQuery } = useContext(ListPageContext)

    const buttonProps: ButtonProps = {
        size: "sm",
        variant: "solid",
        type: "button",
        className: "bg-accented",
    }

    const viewButtonProps = (mode: typeof viewMode) => ({
        ...buttonProps,
        isToggled: viewMode === mode,
        setIsToggled: () => setViewMode(mode),
        onPress: () => setViewMode(mode),
        isIconOnly: true
    })

    return (
        <div className=" flex items-center gap-2 mt-2 mb-5 animate-fade-in">
            <Button
                {...buttonProps}
                onPress={() => router.push(`/lists/${list.id}/add`)}
            >
                <BiPlus className="text-lg" />New Item
            </Button>

            <Divider orientation="vertical" className="h-5" />

            <div className="flex-grow flex gap-x-2">
                {badgeableTags.map(tag => {
                    const isToggled = tagsQuery?.includes(tag.label)
                    return (
                        <ToggleButton
                            key={tag.id}
                            color="default"
                            activeColor={badgeColors.get(tag.badgeable || "")}
                            isToggled={isToggled}
                            setIsToggled={() => toggleTagQuery(tag)}
                            {...buttonProps}
                        >
                            {isToggled ? <FaDiamond className="text-md" /> : <LuDiamond className="text-md" />}
                            {tag.label}
                        </ToggleButton>
                    )
                })}
            </div>

            <Divider orientation="vertical" className="h-5 ml-auto" />

            <ToggleButton
                {...buttonProps}
                onPress={() => setShowTags(!showTags)}
            >
                <BiPurchaseTag className="text-lg" />Tags
            </ToggleButton>

            <Divider orientation="vertical" className="h-5 ml-auto" />

            {/* View Buttons */}

            {/* <ToggleButton {...viewButtonProps("list")}>
                <TfiViewListAlt className="text-sm" />
            </ToggleButton> */}

            <ToggleButton {...viewButtonProps("cardsList")} >
                <CiGrid2H className="text-lg" />
            </ToggleButton>

            <ToggleButton {...viewButtonProps("cards")} >
                <IoGridOutline className="text-lg" />
            </ToggleButton>

            <Divider orientation="vertical" className="h-5" />

            <ListActionsDropMenu>
                <Button {...buttonProps} isIconOnly>
                    <BiDotsVerticalRounded className="text-lg" />
                </Button>
            </ListActionsDropMenu>

        </div>
    )
}

function ListActionsDropMenu({
    children
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const { list } = useContext(ListPageContext)

    const mutateTrash = useMutation({
        mutationFn: (trash: boolean) => {
            return trash
                ? httpClient().delete(`lists/${list.id}`)
                : httpClient().patch(`trash`, { lists: [list.id] })
        },
        onSuccess: (res: { items: ItemData } | ItemData) => {
            if ('items' in res)
                return mutateItemCache(res.items, 'add') //restored
            router.push('/')
            mutateItemCache(res, 'delete')// moved to trash
        }
    })

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <Dropdown>
                <DropdownTrigger>
                    {children}
                </DropdownTrigger>
                <DropdownMenu aria-label="List Actions">
                    <DropdownItem
                        key="refresh"
                        startContent={<BiRevision className="text-lg" />}
                        onPress={() => queryClient.invalidateQueries({ queryKey: ['items', list.id, { trash: false }] })}
                    >
                        Refresh
                    </DropdownItem>
                    <DropdownItem
                        key="edit"
                        startContent={<BiPencil className="text-lg" />}
                        onPress={() => router.push(`/lists/${list.id}/edit`)}
                    >
                        Edit
                    </DropdownItem>
                    {list.trash
                        ? <DropdownItem
                            key="delete"
                            startContent={<BiRedo className="text-lg" />}
                            className="text-primary"
                            color="primary"
                            onPress={() => mutateTrash.mutate(false)}
                        >
                            Restore from Trash
                        </DropdownItem>
                        : <DropdownItem
                            key="delete"
                            startContent={<BiTrash className="text-lg" />}
                            className="text-danger"
                            color="danger"
                            onPress={onOpen}
                        >
                            Move to Trash
                        </DropdownItem>
                    }

                </DropdownMenu>
            </Dropdown>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <DeleteModal onPress={() => mutateTrash.mutate(true)} />
            </Modal>
        </>
    )
}

function DeleteModal({ onPress }: { onPress: () => void }) {
    return (
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">Are You Sure?</ModalHeader>
                    <ModalBody>
                        <p>This list will be moved to the trash. You can restore it from there.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="danger"
                            variant="bordered"
                            onPress={() => {
                                onPress()
                                onClose()
                            }}
                        >
                            Move to Trash
                        </Button>
                        <Button color="primary" onPress={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    )
}