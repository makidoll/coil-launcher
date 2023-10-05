import { Flex, Text } from "@chakra-ui/react";
import { Game } from "../ApplicationStore";
import GameTitle from "../components/GameTitle";
import MechanyxButton from "../components/MechanyxButton";

export default function GameInfo(props: { game: Game }) {
	return (
		<Flex flexDir={"column"} h={"100%"}>
			<Flex
				h={"128px"}
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
			<Flex p={4} flexDir={"column"} alignItems={"start"} h={"100%"}>
				{/* <Button
					colorScheme="blue"
					w="250px"
					fontWeight={800}
					letterSpacing={"0px"}
					color="white"
					background="brand.500"
					mb={4}
				>
					PLAY NOW
				</Button> */}
				<MechanyxButton>PLAY NOW</MechanyxButton>
				<Text>Made by Melody and Maki</Text>
				{/* <Box flexGrow={1}></Box> */}
			</Flex>
		</Flex>
	);
}
