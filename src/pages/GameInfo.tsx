import { Box, Flex, HStack, Progress, Text, VStack } from "@chakra-ui/react";
import { FaDownload, FaFolderOpen, FaPlay, FaTrash } from "react-icons/fa6";
import GameTitle from "../components/GameTitle";
import StandardButton from "../components/StandardButton";
import {
	Game,
	GameInstallState,
	deleteGame,
	installOrUpdateGame,
	launchGame,
	openGameFolder,
	useGameStore,
} from "../states/GameStore";

function Version(props: { key: string; title: string; version: string }) {
	return (
		<VStack spacing={1} ml={1} key={props.key}>
			<Text fontWeight={"400"} fontSize={"14px"} mt={-1.5}>
				{props.title}
			</Text>
			<Text
				fontWeight={"900"}
				fontSize={"12px"}
				lineHeight={"12px"}
				textTransform={"uppercase"}
			>
				{props.version}
			</Text>
		</VStack>
	);
}

export default function GameInfo(props: { slug: string }) {
	const game = useGameStore(state =>
		state.games.find(game => game.slug == props.slug),
	);

	if (game == null) {
		// TODO: error maybe?
		return <></>;
	}

	const installingProgress = useGameStore(
		state => state.installing[game.slug],
	);

	const installing = installingProgress != null;

	const playBarLeft: JSX.Element[] = [];
	const playBarRight: JSX.Element[] = [];

	switch (game.installState) {
		case GameInstallState.Install:
			playBarLeft.push(
				<StandardButton
					key={"install-button"}
					leftIcon={<FaDownload />}
					isLoading={installing}
					onClick={() => installOrUpdateGame(game)}
				>
					Install
				</StandardButton>,
			);
			break;

		case GameInstallState.Update:
			playBarLeft.push(
				<StandardButton
					key={"update-button"}
					leftIcon={<FaDownload />}
					isLoading={installing}
					onClick={() => installOrUpdateGame(game)}
				>
					Update
				</StandardButton>,
			);
			break;

		case GameInstallState.Play:
			playBarLeft.push(
				<StandardButton
					key={"play-button"}
					leftIcon={<FaPlay />}
					isLoading={installing}
					onClick={() => launchGame(game)}
				>
					Play
				</StandardButton>,
			);
			playBarRight.push(
				<StandardButton
					key="open-game-folder"
					colorScheme="brandBehind"
					baseWeight={700}
					isLoading={installing}
					onClick={() => openGameFolder(game)}
				>
					<FaFolderOpen />
				</StandardButton>,
				<StandardButton
					key={"delete-game"}
					colorScheme="red"
					isLoading={installing}
					onClick={() => deleteGame(game)}
				>
					<FaTrash />
				</StandardButton>,
			);
			break;
	}

	if (
		game.installState == GameInstallState.Update ||
		game.installState == GameInstallState.Play
	) {
		playBarLeft.push(
			<Version
				key="installed-version"
				title="Installed"
				version={game.installed.version}
			/>,
		);
	}

	if (
		game.installState == GameInstallState.Install ||
		game.installState == GameInstallState.Update
	) {
		playBarLeft.push(
			<Version
				key="latest-version"
				title="Latest"
				version={game.latest == null ? "None" : game.latest.version}
			/>,
		);
	}

	return (
		<Flex flexDir={"column"} h={"100%"}>
			<Flex
				minH={"128px"}
				maxH={"128px"}
				w="100%"
				backgroundColor={"brandBehind.600"}
				backgroundImage={game.backgroundUrl}
				backgroundPosition={"center"}
				backgroundSize={"cover"}
				flexDir={"row"}
				alignItems={"end"}
				p={4}
			>
				<GameTitle game={game} />
			</Flex>
			{installing ? (
				<Progress
					hasStripe
					value={installingProgress}
					isAnimated
					size={"sm"}
				/>
			) : null}
			<HStack w="100%" spacing={4} background={"brandBehind.850"} p={4}>
				{playBarLeft}
				<Box flexGrow={1}></Box>
				{playBarRight}
			</HStack>
			<Box p={4} flexGrow={1}>
				<Text>{game.description}</Text>
			</Box>
		</Flex>
	);
}
