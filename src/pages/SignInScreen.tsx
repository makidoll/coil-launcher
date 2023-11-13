import { Center, Flex, Input, Text, VStack, chakra } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { LoginMethod, useAuthStore } from "../states/AuthStore";
import MechanyxCoilLogo from "../components/MechanyxCoilLogo";
import StandardButton from "../components/StandardButton";
import { hexColorMix } from "../color-utils";
import { FaAt, FaDiscord } from "react-icons/fa6";

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

export default function SignInScreen() {
	const auth = useAuthStore(({ login, autoLogin, logout }) => ({
		login,
		autoLogin,
		logout,
	}));

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [onPasswordScreen, setOnPasswordScreen] = useState(false);

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
				LoginMethod.Password,
				values.usernameOrEmail,
				values.password,
			);
			setError(res.error);
			setLoading(false);
		},
	});

	const signInWithDiscord = useCallback(async () => {
		// dont set to loading incase the user closes the auth page
		// setLoading(true);
		const res = await auth.login(LoginMethod.Discord);
		setError(res.error);
		// setLoading(false);
	}, [auth]);

	return (
		<Flex w={"100%"} h={"100%"} flexDir={"column"}>
			<Center flexGrow={1}>
				<VStack w={"300px"} spacing={2} mt={-8}>
					<MechanyxCoilLogo fill="#fff" w="100%" mb={2} />
					{onPasswordScreen ? (
						<chakra.form onSubmit={formik.handleSubmit} w="100%">
							<VStack w="100%" spacing={2}>
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
									mt={3}
									w="100%"
									type="submit"
									isLoading={loading}
									isDisabled={
										!formik.dirty || !formik.isValid
									}
								>
									Sign in
								</StandardButton>
								<StandardButton
									w="100%"
									type="button"
									isDisabled={loading}
									linkButton
									opacity={0.5}
									mt={2}
									onClick={() => {
										setOnPasswordScreen(false);
									}}
								>
									Use a different method
								</StandardButton>
							</VStack>
						</chakra.form>
					) : (
						<>
							<StandardButton
								w="100%"
								isLoading={loading}
								// isDisabled={!formik.dirty || !formik.isValid}
								background={"#404eed"}
								_hover={{
									background: hexColorMix(
										"#404eed",
										"#fff",
										0.1,
									),
								}}
								onClick={signInWithDiscord}
								leftIcon={<FaDiscord size="24" />}
							>
								Discord
							</StandardButton>
							<StandardButton
								w="100%"
								isLoading={loading}
								// isDisabled={!formik.dirty || !formik.isValid}
								// background={"#404eed"}
								// _hover={{
								// 	background: hexColorMix("#404eed", "#fff", 0.1),
								// }}
								colorScheme={"brandBehind"}
								baseWeight={700}
								onClick={() => setOnPasswordScreen(true)}
								leftIcon={<FaAt size="20" />}
							>
								Password
							</StandardButton>
						</>
					)}
				</VStack>
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
