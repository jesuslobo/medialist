import httpClient from "@/utils/lib/httpClient";
import { mutateUserCache } from "@/utils/lib/tanquery/usersQuery";
import { ServerResponseError, UserData } from "@/utils/types/global";
import { Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import StatusSubmitButton from "../../ui/buttons/StatusSubmitButton";

type UserSignupForm = UserData & { password: string }

function SignupForm() {
    const { handleSubmit, formState: { errors }, control } = useForm<UserSignupForm>()

    const mutation = useMutation({
        mutationFn: (data: Partial<UserSignupForm>) => httpClient().post('users', data),
        onSuccess: (data) => mutateUserCache(data),
    })

    const resErrorCause = (mutation.error as ServerResponseError)?.cause

    // const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    function onSubmit(data: UserSignupForm) {
        const formData = { username: data.username.trim(), password: data.password } //email: data.email.trim()
        mutation.mutate(formData)
    }


    return (
        <form className=" flex justify-center flex-wrap gap-y-3 max-w-[30rem]">
            <Controller
                control={control}
                name="username"
                rules={{
                    required: true,
                    minLength: { value: 3, message: "Username must be at least 3 characters" },
                    maxLength: { value: 31, message: "Username must be at most 31 characters" }
                }}
                render={({ field }) =>
                    <Input
                        isInvalid={Boolean(errors.username || resErrorCause?.username)}
                        color={(errors.username || resErrorCause?.username) ? "danger" : undefined}
                        errorMessage={errors.username?.message || resErrorCause?.username}
                        className="shadow-sm rounded-xl max-w-[30rem] "
                        type="text"
                        label="Username"
                        {...field}
                    />
                } />

            {/* <Controller
                control={control}
                name="email"
                rules={{
                    required: true, pattern: {
                        value: emailRegex,
                        message: 'Please enter a valid email',

                    }
                }}
                render={({ field }) =>
                    <Input
                        isInvalid={errors.email && true}
                        color={errors.email && "danger"}
                        errorMessage={errors.email?.message}
                        className="shadow-sm rounded-xl max-w-[30rem]"
                        type="text"
                        label="Email"
                        {...field}
                    />
                } /> */}
            <Controller
                control={control}
                name="password"
                rules={{
                    required: true,
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                }}
                render={({ field }) =>
                    <Input
                        isInvalid={Boolean(errors.password || resErrorCause?.password)}
                        color={(errors.password || resErrorCause?.password) ? "danger" : undefined}
                        errorMessage={errors.password?.message || resErrorCause?.password}
                        className="shadow-sm rounded-xl max-w-[30rem]"
                        type="password"
                        label=" Password"
                        {...field}
                    />
                } />

            {mutation.isError && <label className="text-red-500 w-full text-center">{mutation.error.message}</label>}

            <StatusSubmitButton
                mutation={mutation}
                onPress={handleSubmit(onSubmit)}
                defaultContent="Sign Up"
                savedContent="Signed Up!"
                type="submit"
                size="lg"
            />

        </form>
    )
}

export default SignupForm;