import axios from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField } from "formik-mui";
import { Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AuthLayout from "../components/AuthLayout";

const schema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password required"),
});

export default function LoginPage() {
    return (
        <AuthLayout title="Welcome back">
            <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const res = await axios.post("http://localhost:5000/api/auth/login", values);
                        localStorage.setItem("token", res.data.token);
                        window.location.href = "/dashboard";
                    } catch (err) {
                        alert(err.response?.data?.message || err.message);
                    }
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Field
                            component={TextField}
                            name="email"
                            label="Email"
                            fullWidth
                            margin="normal"
                        />
                        <Field
                            component={TextField}
                            type="password"
                            name="password"
                            label="Password"
                            fullWidth
                            margin="normal"
                        />
                        <Box mt={2}>
                            <LoadingButton
                                type="submit"
                                fullWidth
                                loading={isSubmitting}
                                variant="contained"
                            >
                                Login
                            </LoadingButton>
                        </Box>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
}
