import { useUser } from "@/components/providers/AuthProvider";
import StatusSubmitButton from "@/components/ui/buttons/StatusSubmitButton";
import ToggleButton from "@/components/ui/buttons/ToggleButton";
import httpClient from "@/utils/lib/httpClient";
import { mutateUserCache } from "@/utils/lib/tanquery/usersQuery";
import { Card, CardBody, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { BiCheckDouble, BiPencil, BiRevision, BiSave } from "react-icons/bi";
import { RiUserLine } from "react-icons/ri";

interface ReqForm {
    newUsername: string,
}

interface ResError {
    cause: {
        username?: string
    },
}

export default function UserPageUsernameCard() {
    const { user } = useUser()

    const [_input, setInput] = useState<string>(user.username)
    const input = _input.trim().toLowerCase()

    const [editMode, _setEditMode] = useState(false)
    const [error, setError] = useState<ResError | null>(null)

    function setEditMode(val: boolean | ((prev: boolean) => boolean)) {
        if (mutation.isSuccess)
            mutation.reset()
        _setEditMode(val)
    }

    const mutation = useMutation({
        mutationFn: (data: ReqForm) => httpClient().patch('users', data),
        onSuccess: mutateUserCache,
        onError: setError
    })

    function onSubmit() {
        if (!input) return
        mutation.mutate({ newUsername: input })

    }

    return (
        <li>
            <Card className="w-full ltr:pl-3 rtl:pr-3 bg-accented/70 flex flex-row items-center gap-x-2 duration-200 hover:bg-accented/90">
                <CardBody className="flex flex-row items-center gap-x-3 ">
                    <RiUserLine className="text-2xl" />
                    <span className="text-lg flex flex-row gap-x-2 items-center flex-grow">
                        Username: <span className="text-foreground-500 animate-fade-in">{!editMode && user.username}</span>
                        {editMode &&
                            <Input
                                className="text-foreground-500 animate-fade-in"
                                placeholder="New Username"
                                type="text"
                                value={_input}
                                onValueChange={setInput}
                                isInvalid={Boolean(error?.cause?.username)}
                                color={error?.cause?.username ? "danger" : undefined}
                                errorMessage={error?.cause?.username}
                            />
                        }
                    </span>
                    {editMode &&
                        <StatusSubmitButton
                            className="animate-fade-in"
                            title="Restore"
                            mutation={mutation}
                            onPress={onSubmit}
                            defaultContent={<BiSave className="text-xl" />}
                            savedContent={<BiCheckDouble className="text-xl" />}
                            errorContent={<BiRevision className="text-xl" />}
                            isDisabled={input === user.username}
                            isIconOnly
                        />
                    }
                    <ToggleButton
                        isToggled={editMode}
                        setIsToggled={setEditMode}
                        isIconOnly
                    >
                        <BiPencil className="text-xl" />
                    </ToggleButton>
                </CardBody>
            </Card>
        </li>
    )
}