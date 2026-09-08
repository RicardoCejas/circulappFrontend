import AuthLayout from "../components/AuthLayout";
import RegisterForm from "./components/RegisterForm";
import RegisterFooter from "./components/RegisterFooter";
import useRegister from "./hooks/useRegister";

const Register = () => {
    const register = useRegister();

    return (
        <AuthLayout
            title="Crear cuenta"
            subtitle={
                <>
                    Únete a{" "}
                    <span className="font-semibold text-primary">
                        ComunaRed
                    </span>
                </>
            }
            error={register.error}
        >
            <RegisterForm {...register} />

            <RegisterFooter />
        </AuthLayout>
    );
};

export default Register;