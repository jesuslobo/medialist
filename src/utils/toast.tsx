import { Button, PressEvent, ToastProps } from "@heroui/react";
import { IconType } from "react-icons";
import { BiLinkAlt, BiRevision } from "react-icons/bi";

type Color = "success" | "default" | "foreground" | "primary" | "secondary" | "warning" | "danger" | undefined
type onPress = (e: PressEvent) => void

export const actionToast = (title: string, onPress: onPress, color: Color = "success", Icon: IconType = BiLinkAlt, props?: Partial<ToastProps>) => ({
    title,
    color,
    endContent: (
        <Button
            size="sm"
            variant="flat"
            onPress={onPress}
            isIconOnly
        >
            <Icon className="text-xl" />
        </Button>
    ),
    ...props
}) as ToastProps

export const errorToast = (title: string, onPress: onPress) => actionToast(title, onPress, "danger", BiRevision)

export const simpleToast = (title: string, color: Color = "success", description?: string) => ({
    title,
    color,
    description,
}) as ToastProps