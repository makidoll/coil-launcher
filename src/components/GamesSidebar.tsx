import { Box, Center, Flex, HStack, Image, Text } from "@chakra-ui/react";
import { FaDownload, FaPlay, FaSquareXmark, FaX } from "react-icons/fa6";
import { Game, GameInstallState, useGameStore } from "../states/GameStore";
import { ReactElement, useEffect, useState } from "react";

function GameItem(props: { game: Game; onClick: () => any }) {
	const game = props.game;

	let icon: ReactElement;

	if (!game.available) {
		icon = <FaX size="16px" style={{ opacity: 0.25 }} />;
	} else {
		switch (game.installState) {
			case GameInstallState.Install:
				icon = <FaDownload size="16px" style={{ opacity: 0.25 }} />;
				break;
			case GameInstallState.Update:
				icon = <FaDownload size="16px" style={{ opacity: 0.65 }} />;
				break;
			case GameInstallState.Play:
				icon = <FaPlay size="16px" style={{ opacity: 0.65 }} />;
				break;
		}
	}

	return (
		<HStack
			w="100%"
			minH={"32px"}
			maxH={"32px"}
			borderBottom={"solid 1px var(--chakra-colors-brandBehind-700)"}
			alignItems={"center"}
			justifyContent={"start"}
			pl="6px"
			spacing={0}
			onClick={props.onClick}
			cursor={"pointer"}
			_hover={{ background: "brandBehind.700" }}
			transitionProperty="var(--chakra-transition-property-common)"
			transitionDuration="var(--chakra-transition-duration-normal)"
		>
			<HStack
				spacing={2}
				overflow={"hidden"}
				opacity={
					game.installState == GameInstallState.Install ? 0.3 : 1
				}
			>
				{game.iconUrl ? (
					<Image src={game.iconUrl} h={"24px"} w={"24px"} />
				) : (
					<Box
						h={"24px"}
						w={"24px"}
						bg={"brandBehind.600"}
						borderRadius={"999px"}
					/>
				)}
				<Text fontSize={"sm"} fontWeight={"medium"}>
					{game.name}
				</Text>
			</HStack>
			{icon != null ? (
				<>
					<Box flexGrow={1}></Box>
					<Center minW="32px" maxW="32px" h="100%">
						{icon}
					</Center>
				</>
			) : (
				<></>
			)}
		</HStack>
	);
}

export default function GamesSidebar(props: {
	onGame: (game: Game) => any;
	onFirstGameLoaded: (game: Game) => any;
}) {
	const games = useGameStore(state => state.games);

	const [firstGameLoaded, setFirstGameLoaded] = useState<Game>(null);

	useEffect(() => {
		if (firstGameLoaded != null) return;
		if (games.length == 0) return;
		setFirstGameLoaded(games[0]);
		props.onFirstGameLoaded(games[0]);
	}, [games]);

	return (
		<Flex
			minW={200}
			maxW={200}
			height={"100%"}
			flexDir={"column"}
			background={"brandBehind.800"}
			// borderTop={"solid 1px var(--chakra-colors-brandBehind-700)"}
			// borderRight={"solid 1px var(--chakra-colors-brandBehind-700)"}
		>
			{games.map((game, i) => (
				<GameItem
					key={i}
					game={game}
					onClick={() => {
						props.onGame(game);
					}}
				/>
			))}
		</Flex>
	);
}
