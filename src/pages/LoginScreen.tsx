import {
	Center,
	Flex,
	HStack,
	Icon,
	Input,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { SiSpringCreators } from "react-icons/si";
import { useAuthStore } from "../AuthStore";
import MechanyxButton from "../components/MechanyxButton";
import MechanyxCoilLogo from "../components/MechanyxCoilLogo";

export default function LoginScreen() {
	const auth = useAuthStore();
	const usernameOrEmailRef = useRef<HTMLInputElement>();
	const passwordRef = useRef<HTMLInputElement>();
	const [error, setError] = useState("");

	const loginWithCreds = useCallback(async () => {
		const res = await auth.loginWithPassword(
			usernameOrEmailRef.current.value,
			passwordRef.current.value,
		);

		setError(res.error);
	}, [auth, usernameOrEmailRef, passwordRef, setError]);

	// TODO: add loading, disabling input, and pressing enter. basically formik

	return (
		<Flex w={"100%"} h={"100%"} flexDir={"column"}>
			<Center flexGrow={1}>
				<VStack w={"300px"} spacing={2} mt={-8}>
					<MechanyxCoilLogo color="#fff" w="100%" />
					<Input
						ref={usernameOrEmailRef}
						placeholder="Username or Email"
					/>
					<Input
						ref={passwordRef}
						placeholder="Password"
						type="password"
					/>
					<MechanyxButton mt={2} w="100%" onClick={loginWithCreds}>
						Login
					</MechanyxButton>
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
