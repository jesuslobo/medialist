import httpClient from "@/utils/lib/httpClient";
import { mutateUserCache } from "@/utils/lib/tanquery/usersQuery";
import { ServerResponseError, UserData } from "@/utils/types/global";
import { Input } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
import { Controller, useForm } from "react-hook-form";
import StatusSubmitButton from "../../ui/buttons/StatusSubmitButton";

type UserLoginForm = UserData & { password: string }

function LoginForm() {
    const { handleSubmit, formState: { errors }, control } = useForm<UserLoginForm>()

    const mutation = useMutation({
        mutationFn: (data: Partial<UserLoginForm>) => httpClient().post('sessions', data),
        onSuccess: (data) => mutateUserCache(data),
    })

    const resErrorCause = (mutation.error as ServerResponseError)?.cause

    function onSubmit(data: UserLoginForm) {
        const formData = { username: data.username.trim(), password: data.password }
        mutation.mutate(formData)
    }

    return (
        <form className="flex justify-center flex-col gap-y-3" onSubmit={e => e.preventDefault()}>
            <Head>
                <title>MediaList - Login</title>
            </Head>
            <section className="py-3 text-center">
                <p className="text-7xl py-3 -ml-5">👋</p>
                <h1 className="text-2xl ">Welcome Back!</h1>
                <p className=" text-foreground-500">Log In to Your Account</p>
            </section>
            <section className="space-y-2 animate-fade-in">
                <Controller
                    control={control}
                    name="username"
                    rules={{ required: true }}
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
                defaultContent="Login"
                savedContent="Logged In"
            />
            {/* <button className="text-center text-sm text-foreground-500">Forgot Password?</button> for future */}
        </form>
    )

}

export default LoginForm;