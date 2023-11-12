import {
	Box,
	Button,
	ChakraProvider,
	Flex,
	HStack,
	Progress,
	StylesProvider,
	Text,
	VStack,
	defineStyleConfig,
	extendBaseTheme,
	extendTheme,
	useMultiStyleConfig,
	useStyleConfig,
} from "@chakra-ui/react";
import { Game } from "../ApplicationStore";
import GameTitle from "../components/GameTitle";
import StandardButton from "../components/StandardButton";
import {
	FaDownload,
	FaPlay,
	FaTrash,
	FaFolderOpen,
	FaRegFolderOpen,
} from "react-icons/fa6";

export default function GameInfo(props: { game: Game }) {
	const customTheme = extendBaseTheme({
		components: {
			Progress: {
				baseStyle: {
					filledTrack: {
						bg: "red",
					},
				},
			},
		},
	});

	console.log(customTheme);

	return (
		<Flex flexDir={"column"} h={"100%"}>
			<Flex
				minH={"96px"}
				maxH={"96px"}
				w="100%"
				backgroundImage={props.game.bgUrl}
				backgroundPosition={"center"}
				backgroundSize={"cover"}
				flexDir={"row"}
				alignItems={"end"}
				p={4}
			>
				<GameTitle game={props.game} />
			</Flex>
			<Progress hasStripe value={64} isAnimated size={"sm"} />
			<Flex p={4} flexDir={"column"} alignItems={"start"} h={"100%"}>
				<HStack w="100%" mb={3} spacing={4}>
					<StandardButton leftIcon={<FaPlay />}>Play</StandardButton>
					<StandardButton leftIcon={<FaDownload />}>
						Install
					</StandardButton>
					<StandardButton colorScheme="red">
						<FaTrash />
					</StandardButton>
					<StandardButton colorScheme="brandBehind" baseWeight={700}>
						<FaFolderOpen />
					</StandardButton>
					<Text fontWeight={"800"}>400 MB</Text>
				</HStack>
				<Text>Made by Melody and Maki</Text>
			</Flex>
		</Flex>
	);
}
