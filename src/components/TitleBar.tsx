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
import { useAuthStore } from "../AuthStore";

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
			background={"#333"}
			{...props}
			_hover={{
				background: "#444",
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
						icon={<FaArrowLeft color="#ccc" size={18} />}
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
						<Menu zIndex={9500}>
							<MenuButton
								as={Button}
								size="sm"
								// minW="30px"
								// maxW="30px"
								minH="30px"
								maxH="30px"
								pointerEvents={"all"}
								borderRadius={8}
								background={"#333"}
								// color={"#fff"}
								color="#ccc"
								_hover={{
									background: "#444",
								}}
								_active={{
									background: "#444",
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
										Maki
									</chakra.span>
								</HStack>
							</MenuButton>
							<MenuList
								pointerEvents={"all"}
								bg="#222"
								shadow={"lg"}
								zIndex={99999999999999999}
							>
								<MenuItem
									bg="#222"
									_hover={{ bg: "#333" }}
									onClick={auth.logout}
								>
									Logout
								</MenuItem>
								{/* <MenuDivider /> */}
							</MenuList>
						</Menu>
						{/* <TitleBarButton
							aria-label="Reload"
							icon={<FaArrowsRotate color="#ccc" size={18} />}
							onClick={() => {
								alert("refresh games");
							}}
						/> */}
						{/* <Box mx={4}></Box> */}
					</>
				) : (
					<>
						<Box flexGrow={1}></Box>
					</>
				)}
				<TitleBarIconButton
					aria-label="Close"
					icon={<FaXmark color="#ccc" size={22} />}
					onClick={() => {
						appWindow.close();
					}}
				/>
			</HStack>
		</HStack>
	);
}
