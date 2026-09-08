import AuthLayout from "../components/AuthLayout";
import LoginForm from "./components/LoginForm";
import LoginFooter from "./components/LoginFooter";
import useLogin from "./hooks/useLogin";

function Login() {
    const login = useLogin();

    return (
        <AuthLayout
            title="Bienvenido"
            subtitle={
                <>
                    Inicia sesión en{" "}
                    <span className="font-semibold text-primary">
                        ComunaRed
                    </span>
                </>
            }
            error={login.error}
        >
            <LoginForm {...login} />

            <LoginFooter />
        </AuthLayout>
    );
}

export default Login;