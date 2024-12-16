import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton";
import httpClient from "@/utils/lib/httpClient";
import { mutateItemCache } from "@/utils/lib/tanquery/itemsQuery";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useContext } from "react";
import { BiTrash } from "react-icons/bi";
import { itemPageContext } from "../ItemPageProvider";

export default function ItemPageDeleteButton() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
        <>
            <Button
                title="Delete Item"
                size="sm"
                className="text-lg"
                onPress={onOpen}
                isIconOnly
            >
                <BiTrash />
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <DeleteModal />
            </Modal>
        </>
    )
}


function DeleteModal() {
    const router = useRouter()
    const { item } = useContext(itemPageContext)

    const mutation = useMutation({
        mutationFn: () => httpClient().delete(`/items/${item.id}`),
        onSuccess: () => {
            mutateItemCache(item, "delete")
            router.push(`/lists/${item.listId}`)
        },
    })
    return (
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">Are You Sure?</ModalHeader>
                    <ModalBody>
                        <p> You can always restore this item from the Trash.</p>
                    </ModalBody>
                    <ModalFooter>
                        <StatusSubmitButton
                            mutation={mutation}
                            color="danger"
                            variant="bordered"
                            defaultContent="Move to Trash"
                            savedContent="Moved to Trash"
                            onPress={() => {
                                mutation.mutate()
                                onClose()
                            }}
                        />

                        <Button color="primary" onPress={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    )
}