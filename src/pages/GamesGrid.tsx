import {
	Box,
	Flex,
	Grid,
	GridItem,
	HStack,
	Image,
	Text,
} from "@chakra-ui/react";
import { Game, GameInstallState, useGameStore } from "../states/GameStore";
import GameTitle from "../components/GameTitle";
import { FaDownload, FaPlay } from "react-icons/fa6";

export function GameButton(props: { game: Game; onClick: () => any }) {
	const disabled = !props.game.available;

	return (
		<GridItem
			h="114px"
			backgroundImage={props.game.backgroundUrl}
			backgroundColor={disabled ? "brandBehind.700" : "brandBehind.600"}
			backgroundSize={"cover"}
			backgroundPosition={"center"}
			borderRadius={12}
			overflow={"hidden"}
			opacity={disabled ? 0.35 : 1}
			_hover={
				disabled
					? {}
					: {
							transform: "scale(0.95)",
					  }
			}
			transition={"all 100ms ease-out"}
			cursor={disabled ? "default" : "pointer"}
			// shadow={"2xl"}
			// outline={"solid 1px rgba(255,255,255,0.1)"}
			onClick={disabled ? null : props.onClick}
		>
			<Flex w="100%" h="100%" flexDir={"column"} justifyContent={"end"}>
				<Box pl={2} pb={2}>
					<GameTitle game={props.game} />
				</Box>
				<Box w={"100%"} h="24px" bg={"rgba(0,0,0,0.5)"}>
					<HStack mb={-0.5} h="100%" w="100%" ml={2}>
						{disabled ? null : props.game.installState ==
						  GameInstallState.Install ? (
							<FaDownload size="12px" />
						) : props.game.installState ==
						  GameInstallState.Update ? (
							<FaDownload size="12px" />
						) : (
							<FaPlay size="12px" />
						)}
						<Text
							textTransform={"uppercase"}
							fontSize={12}
							fontWeight={900}
							opacity={1}
						>
							{disabled
								? "Unavailable"
								: props.game.installState ==
								  GameInstallState.Install
								? "Install now"
								: props.game.installState ==
								  GameInstallState.Update
								? "Update now"
								: "Play now"}
						</Text>
					</HStack>
				</Box>
			</Flex>
		</GridItem>
	);
}

export default function GamesGrid(props: { onGame: (game: Game) => any }) {
	const games = useGameStore(state => state.games);

	return (
		<Grid w="100%" templateColumns="repeat(4, 1fr)" gap={2} p={2} mt={-2}>
			{games.map((game, i) => (
				<GameButton
					key={i}
					game={game}
					onClick={() => {
						props.onGame(game);
					}}
				/>
			))}
		</Grid>
	);
}
