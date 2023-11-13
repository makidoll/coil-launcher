import {
	Box,
	Button,
	Center,
	HStack,
	Icon,
	IconButton,
	IconButtonProps,
	Image,
	Menu,
	MenuButton,
	MenuDivider,
	MenuGroup,
	MenuItem,
	MenuList,
	Text,
	chakra,
} from "@chakra-ui/react";
import { appWindow } from "@tauri-apps/api/window";
import { FaArrowLeft, FaArrowsRotate, FaXmark } from "react-icons/fa6";
import { SiSpringCreators } from "react-icons/si";
import MechanyxCoilLogo from "./MechanyxCoilLogo";
import { useAuthStore } from "../states/AuthStore";
import { chakraColor } from "../utils";
import { useGameStore } from "../states/GameStore";
import { useState } from "react";

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
	showGoBack: boolean;
	onGoBack: () => any;
}) {
	const auth = useAuthStore(({ loggedIn, username, avatarUrl, logout }) => ({
		loggedIn,
		username,
		avatarUrl,
		logout,
	}));

	const [refreshDisabled, setRefreshDisabled] = useState(false);

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
						<TitleBarIconButton
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
								useGameStore.getState().refreshGames();
								setTimeout(() => {
									setRefreshDisabled(false);
								}, 2000);
							}}
						/>
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
						appWindow.close();
					}}
				/>
			</HStack>
		</HStack>
	);
}
