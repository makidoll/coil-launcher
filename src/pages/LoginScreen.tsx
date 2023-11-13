import { Center, Flex, Input, Text, VStack } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useAuthStore } from "../states/AuthStore";
import MechanyxCoilLogo from "../components/MechanyxCoilLogo";
import StandardButton from "../components/StandardButton";

const validate = (values: any) => {
	const errors: any = {};

	if (!values.usernameOrEmail) {
		errors.usernameOrEmail = "Required";
	}

	if (!values.password) {
		errors.password = "Required";
	}

	return errors;
};

export default function LoginScreen() {
	const auth = useAuthStore(({ login, autoLogin, logout }) => ({
		login,
		autoLogin,
		logout,
	}));

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		(async () => {
			const res = await auth.autoLogin();
			setError(res.error);
			setLoading(false);
		})();
	}, []);

	const formik = useFormik({
		initialValues: {
			usernameOrEmail: "",
			password: "",
		},
		validate,
		onSubmit: async values => {
			setLoading(true);
			const res = await auth.login(
				values.usernameOrEmail,
				values.password,
			);
			setError(res.error);
			setLoading(false);
		},
	});

	return (
		<Flex w={"100%"} h={"100%"} flexDir={"column"}>
			<Center flexGrow={1}>
				<form onSubmit={formik.handleSubmit}>
					<VStack w={"300px"} spacing={2} mt={-8}>
						<MechanyxCoilLogo fill="#fff" w="100%" mb={1} />
						<Input
							placeholder="Username or Email"
							name="usernameOrEmail"
							onChange={formik.handleChange}
							value={formik.values.usernameOrEmail}
							disabled={loading}
						/>
						<Input
							placeholder="Password"
							type="password"
							name="password"
							onChange={formik.handleChange}
							value={formik.values.password}
							disabled={loading}
						/>
						<StandardButton
							mt={2}
							w="100%"
							type="submit"
							isLoading={loading}
							isDisabled={!formik.dirty || !formik.isValid}
						>
							Login
						</StandardButton>
					</VStack>
				</form>
			</Center>
			{error ? (
				<Center w="100%" minH="48px" maxH="48px" background={"red.500"}>
					<Text fontWeight={"500"} flexGrow={1} textAlign={"center"}>
						{error}
					</Text>
				</Center>
			) : (
				<></>
			)}
		</Flex>
	);
}
