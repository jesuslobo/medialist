import { Card, CardBody, CardFooter } from "@heroui/react";
import { useState } from "react";
import { BiPlus } from "react-icons/bi";
import NewListForm from "./NewListForm";

export default function NewListButton() {
    const [isAddMode, setIsAddMode] = useState(false);

    return !isAddMode ? (
        <Card
            className=" group bg-transparent duration-200 hover:scale-110 animate-fade-in"
            shadow="none"
            onPress={() => setIsAddMode(true)}
            isPressable
        >
            <CardBody className="overflow-visible p-0 ">
                <Card
                    className="aspect-square text-foreground shadow-lg items-center justify-center bg-accented"
                    radius="lg"
                >
                    <BiPlus className="text-6xl font-light" />
                </Card>

            </CardBody>

            <CardFooter className="text-small capitalize h-full w-full py-3 flex items-start justify-center  shadow-none duration-200 group-hover:font-bold">
                New List
            </CardFooter>
        </Card>
    ) : (
        <NewListForm setIsAddMode={setIsAddMode} />
    )
}

