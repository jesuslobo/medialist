import RootFooter from "@/components/layouts/RootFooter";
import { Button, Divider } from "@heroui/react";
import { useState } from "react";
import { BiLogInCircle } from "react-icons/bi";
import { VscAccount } from "react-icons/vsc";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthLayout() {
    const [isLogin, setIsLogin] = useState(true)
    const disableSignup = process.env.NEXT_PUBLIC_DISABLE_SIGNUP === 'true';

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <main className="w-full max-w-sm flex flex-col gap-y-3 rounded-large animate-fade-in text-foreground">
                {isLogin ? <LoginForm /> : (
                    disableSignup
                        ? <div className="text-center text-danger">User registration is currently disabled.</div>
                        : <SignupForm />
                )}

                <section className="space-y-2">
                    <Divider className="my-2" />

                    {isLogin
                        ? (!disableSignup && (
                            <Button
                                startContent={<VscAccount size={20} />}
                                className="w-full"
                                variant="flat"
                                onPress={() => setIsLogin(false)}
                            >
                                Create Account
                            </Button>
                        ))
                        : <Button
                            startContent={<BiLogInCircle size={20} />}
                            className="w-full"
                            variant="flat"
                            onPress={() => setIsLogin(true)}
                        >
                            Already a Member? Log In
                        </Button>}
                    <RootFooter />
                </section>
            </main>
        </div>
    )
}