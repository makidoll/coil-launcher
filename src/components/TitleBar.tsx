import {
	Box,
	Center,
	HStack,
	Icon,
	IconButton,
	IconButtonProps,
	Text,
} from "@chakra-ui/react";
import { appWindow } from "@tauri-apps/api/window";
import { FaArrowLeft, FaArrowsRotate, FaXmark } from "react-icons/fa6";
import { SiSpringCreators } from "react-icons/si";

function TitleBarButton(props: IconButtonProps) {
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
		/>
	);
}

export default function TitleBar(props: {
	showGoBack: boolean;
	onGoBack: () => any;
}) {
	return (
		<HStack
			data-tauri-drag-region
			w="100%"
			h="36px"
			zIndex={9999999}
			userSelect={"none"}
			pointerEvents={"all"}
		>
			<HStack
				w="100%"
				h="100%"
				pointerEvents={"none"}
				spacing={1.5}
				px={1}
			>
				{props.showGoBack ? (
					<TitleBarButton
						aria-label="Return"
						icon={<FaArrowLeft color="#ccc" size={18} />}
						onClick={props.onGoBack}
						mr={1}
					/>
				) : (
					<></>
				)}
				<Icon as={SiSpringCreators} h={"100%"} cursor={"pointer"} />
				<Text
					fontWeight={900}
					mt={-0.5}
					letterSpacing={"-0.5px"}
					fontSize={"lg"}
				>
					Mechaynx Coil
				</Text>
				<Box flexGrow={1}></Box>
				<TitleBarButton
					aria-label="Reload"
					icon={<FaArrowsRotate color="#ccc" size={18} />}
					onClick={() => {
						alert("refresh games");
					}}
				/>
				<TitleBarButton
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
