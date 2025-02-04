import httpClient from "@/utils/lib/httpClient";
import { mutateUserCache } from "@/utils/lib/tanquery/usersQuery";
import { ServerResponseError, UserData } from "@/utils/types/global";
import { Input } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
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
        <form className="flex justify-center flex-col gap-y-3" onSubmit={e => e.preventDefault()}>
            <Head>
                <title>MediaList - Create Account</title>
            </Head>
            <section className="py-3 text-center">
                <p className="text-7xl py-3">✨</p>
                <h1 className="text-2xl ">Create Your Account</h1>
                <p className=" text-foreground-500">It’s quick and easy to sign up!</p>
            </section>
            <section className="space-y-2 animate-fade-in">
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
                            label="Username"
                            variant="bordered"
                            placeholder="Enter your username"
                            isInvalid={Boolean(errors.username || resErrorCause?.username)}
                            color={(errors.username || resErrorCause?.username) ? "danger" : undefined}
                            errorMessage={errors.username?.message || resErrorCause?.username}
                            {...field}
                        />
                    } />
                <Controller
                    control={control}
                    name="password"
                    rules={{
                        required: true,
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                    }}
                    render={({ field }) =>
                        <Input
                            label="Password"
                            type="password"
                            variant="bordered"
                            placeholder="Enter your password"
                            isInvalid={Boolean(errors.password || resErrorCause?.password)}
                            color={(errors.password || resErrorCause?.password) ? "danger" : undefined}
                            errorMessage={errors.password?.message || resErrorCause?.password}
                            {...field}
                        />
                    } />
            </section>

            {mutation.isError &&
                <span className="bg-danger/45 w-full text-center p-1 rounded-lg">{mutation.error.message}</span>
            }

            <StatusSubmitButton
                className="w-full font-semibold"
                color="primary"
                type="submit"
                size="md"
                mutation={mutation}
                onPress={handleSubmit(onSubmit)}
                defaultContent="Sign Up"
                savedContent="Signed Up!"
            />

        </form>

    )
}

export default SignupForm;