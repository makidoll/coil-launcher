import {
	Box,
	Button,
	HStack,
	IconButton,
	IconButtonProps,
	Image,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	chakra,
} from "@chakra-ui/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { FaArrowLeft, FaXmark } from "react-icons/fa6";
import { useAuthStore } from "../states/AuthStore";
import { chakraColor } from "../utils";
import MechanyxCoilLogo from "./MechanyxCoilLogo";

function TitleBarIconButton(props: IconButtonProps) {
	return (
		<IconButton
			size="sm"
			minW="30px"
			maxW="30px"
			minH="30px"
			maxH="30px"
			pointerEvents={"all"}
			borderRadius={8}
			background={"brandBehind.700"}
			{...props}
			_hover={{
				background: "brandBehind.600",
			}}
		/>
	);
}

export default function TitleBar(props: {
	loginScreen: boolean;
	showGoBack: boolean;
	onGoBack: () => any;
}) {
	const auth = useAuthStore(({ loggedIn, username, avatarUrl, logout }) => ({
		loggedIn,
		username,
		avatarUrl,
		logout,
	}));

	// const [refreshDisabled, setRefreshDisabled] = useState(false);

	return (
		<HStack
			data-tauri-drag-region
			w="100%"
			minH="36px"
			maxH="36px"
			zIndex={9000}
			userSelect={"none"}
			pointerEvents={"all"}
			// bg={"red"}
			background={props.loginScreen ? "transparent" : "brandBehind.850"}
		>
			<HStack
				w="100%"
				h="100%"
				pointerEvents={"none"}
				spacing={1.5}
				px={1}
			>
				{props.showGoBack ? (
					<TitleBarIconButton
						aria-label="Return"
						icon={
							<FaArrowLeft
								color={chakraColor("brandBehind.50")}
								size={18}
							/>
						}
						onClick={props.onGoBack}
						mr={1}
					/>
				) : (
					<></>
				)}
				{auth.loggedIn ? (
					<>
						<MechanyxCoilLogo fill="#fff" h="22px" ml="6px" />
						<Box flexGrow={1}></Box>
						<Menu>
							<MenuButton
								as={Button}
								size="sm"
								// minW="30px"
								// maxW="30px"
								minH="30px"
								maxH="30px"
								pointerEvents={"all"}
								borderRadius={8}
								background={"brandBehind.700"}
								// color={"#fff"}
								color={chakraColor("brandBehind.50")}
								_hover={{
									background: "brandBehind.600",
								}}
								_active={{
									background: "brandBehind.600",
								}}
								fontWeight={600}
								overflow={"hidden"}
							>
								<HStack>
									<Image
										src={auth.avatarUrl}
										w={"30px"}
										ml={"-12px"}
									/>
									<chakra.span fontWeight={800} mx={1}>
										{auth.username}
									</chakra.span>
								</HStack>
							</MenuButton>
							<MenuList
								pointerEvents={"all"}
								bg="brandBehind.800"
								shadow={"lg"}
								zIndex={9500}
							>
								<MenuItem
									bg="brandBehind.800"
									_hover={{ bg: "brandBehind.700" }}
									onClick={auth.logout}
								>
									Logout
								</MenuItem>
								{/* <MenuDivider /> */}
							</MenuList>
						</Menu>
						{/* dont need a refresh button when we have realtime updates */}
						{/* <TitleBarIconButton
							aria-label="Reload"
							isDisabled={refreshDisabled}
							icon={
								<FaArrowsRotate
									color={chakraColor("brandBehind.50")}
									size={18}
								/>
							}
							onClick={() => {
								setRefreshDisabled(true);
								refreshGames();
								setTimeout(() => {
									setRefreshDisabled(false);
								}, 2000);
							}}
						/> */}
					</>
				) : (
					<>
						<Box flexGrow={1}></Box>
					</>
				)}
				<TitleBarIconButton
					aria-label="Close"
					icon={
						<FaXmark
							color={chakraColor("brandBehind.50")}
							size={22}
						/>
					}
					onClick={() => {
						getCurrentWindow().close();
					}}
				/>
			</HStack>
		</HStack>
	);
}
