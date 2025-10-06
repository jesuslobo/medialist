import { useQuery } from '@tanstack/react-query';
import RootFooter from "@/components/layouts/RootFooter";
import { Button, Divider } from "@heroui/react";
import { useState } from "react";
import { BiLogInCircle } from "react-icons/bi";
import { VscAccount } from "react-icons/vsc";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const fetchConfig = async () => {
    const res = await fetch('/api/config');
    return res.json();
};

export default function AuthLayout() {
    const [isLogin, setIsLogin] = useState(true);
    const { data } = useQuery({ queryKey: ['config'], queryFn: fetchConfig });
    const disableSignup = data?.disableSignup;

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