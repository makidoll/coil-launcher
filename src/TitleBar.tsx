import { HStack, Icon, Text } from "@chakra-ui/react";
import { appWindow } from "@tauri-apps/api/window";
import { FaXmark } from "react-icons/fa6";
import { SiSpringCreators } from "react-icons/si";

export default function TitleBar() {
	return (
		<HStack
			data-tauri-drag-region
			w="100%"
			h="32px"
			zIndex={9999999}
			userSelect={"none"}
			pointerEvents={"all"}
		>
			<HStack
				w="100%"
				h="100%"
				pointerEvents={"none"}
				spacing={1.5}
				px={2}
			>
				<Icon
					as={SiSpringCreators}
					h={"100%"}
					my={-4}
					cursor={"pointer"}
				/>
				<Text
					fontWeight={900}
					mb={-0.5}
					flexGrow={1}
					letterSpacing={"-0.5px"}
				>
					Mechaynx Coil
				</Text>
				<Icon
					as={FaXmark}
					h={"100%"}
					my={-4}
					cursor={"pointer"}
					pointerEvents={"all"}
					onClick={() => {
						appWindow.close();
					}}
				/>
			</HStack>
		</HStack>
	);
}
