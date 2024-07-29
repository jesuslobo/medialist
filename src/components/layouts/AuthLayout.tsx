import { Tab, Tabs } from "@nextui-org/react";
import Head from "next/head";
import LoginForm from "../features/auth/LoginForm";
import SignupForm from "../features/auth/SignupForm";

export default function AuthLayout() {
    return (
        <div className="w-full flex flex-col items-center mt-[14%] animate-fade-in">
            <Tabs className="max-w-[30rem]" aria-label="auth-option" size="lg" color="primary" fullWidth>
                <Tab key="login" title="Login">
                    <Head>
                        <title>MediaList - Login</title>
                    </Head>
                    <LoginForm />
                </Tab>
                <Tab key="signup" title="Sign Up">
                    <Head>
                        <title>MediaList - SignUp</title>
                    </Head>
                    <SignupForm />
                </Tab>
            </Tabs>
        </div>
    )
}