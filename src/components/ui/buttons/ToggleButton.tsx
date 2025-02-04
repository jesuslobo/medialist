import { Button, ButtonProps } from "@heroui/react";
import React, { useState } from "react";
import { twJoin } from "tailwind-merge";

type HexColor = string;

interface ToggleButtonProps extends ButtonProps {
    isToggled?: boolean,
    setIsToggled?: React.Dispatch<React.SetStateAction<boolean>>,
    activeColor?: HexColor | "primary" | "default" | "secondary" | "success" | "warning" | "danger",
    toggledChildren?: React.ReactNode,
}

export default function ToggleButton({
    children,
    toggledChildren,
    isToggled,
    setIsToggled,
    activeColor = "primary",
    className,
    onPress,
    ...buttonProps
}: ToggleButtonProps) {
    const [isToggledH, setIsToggledH] = useState(false);

    isToggled ||= isToggledH;
    setIsToggled ||= setIsToggledH;

    const colors = ["primary", "default", "secondary", "success", "warning", "danger"]
    const colorClass = colors.includes(activeColor) ? `bg-${activeColor}` : activeColor;

    return (
        <Button
            {...buttonProps}
            className={twJoin(className, isToggled && colorClass)}
            onPress={(e) => {
                setIsToggled?.(a => !a);
                onPress?.(e);
            }}
        >
            {isToggled && toggledChildren || children}
        </Button>
    );
}