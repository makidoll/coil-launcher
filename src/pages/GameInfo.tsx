import { Flex, HStack, Progress, Text, VStack } from "@chakra-ui/react";
import { FaDownload, FaFolderOpen, FaPlay, FaTrash } from "react-icons/fa6";
import GameTitle from "../components/GameTitle";
import StandardButton from "../components/StandardButton";
import {
	Game,
	GameInstallState,
	deleteGame,
	installOrUpdateGame,
	launchGame,
	useGameStore,
} from "../states/GameStore";

export default function GameInfo(props: { slug: string }) {
	const game = useGameStore(state =>
		state.games.find(game => game.slug == props.slug),
	);

	if (game == null) {
		return <></>;
	}

	const installState = game.installState;

	const installingProgress = useGameStore(
		state => state.installing[game.slug],
	);

	const installing = installingProgress != null;

	return (
		<Flex flexDir={"column"} h={"100%"}>
			<Flex
				minH={"96px"}
				maxH={"96px"}
				w="100%"
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
			<Flex p={4} flexDir={"column"} alignItems={"start"} h={"100%"}>
				<HStack w="100%" mb={3} spacing={4}>
					{installState == GameInstallState.Install ? (
						<StandardButton
							leftIcon={<FaDownload />}
							isLoading={installing}
							onClick={() => installOrUpdateGame(game)}
						>
							Install
						</StandardButton>
					) : (
						<>
							{installState == GameInstallState.Update ? (
								<StandardButton
									leftIcon={<FaDownload />}
									isLoading={installing}
									onClick={() => installOrUpdateGame(game)}
								>
									Update
								</StandardButton>
							) : (
								<StandardButton
									leftIcon={<FaPlay />}
									isLoading={installing}
									onClick={() => launchGame(game)}
								>
									Play
								</StandardButton>
							)}
							<StandardButton
								colorScheme="red"
								isLoading={installing}
								onClick={() => deleteGame(game)}
							>
								<FaTrash />
							</StandardButton>
							<StandardButton
								colorScheme="brandBehind"
								baseWeight={700}
								isLoading={installing}
								isDisabled={true}
							>
								<FaFolderOpen />
							</StandardButton>
						</>
					)}
					{installState != GameInstallState.Install ? (
						<VStack spacing={1} ml={1}>
							<Text fontWeight={"400"}>Installed</Text>
							<Text
								fontWeight={"900"}
								fontSize={"12px"}
								lineHeight={"12px"}
							>
								{game.installed.version}
							</Text>
						</VStack>
					) : (
						<></>
					)}
					{installState == GameInstallState.Update ? (
						<VStack spacing={1}>
							<Text fontWeight={"400"}>Available</Text>
							<Text
								fontWeight={"900"}
								fontSize={"12px"}
								lineHeight={"12px"}
								textTransform={"uppercase"}
							>
								{game.latest == null
									? "None"
									: game.latest.version}
							</Text>
						</VStack>
					) : (
						<></>
					)}
				</HStack>
				<Text>{game.description}</Text>
			</Flex>
		</Flex>
	);
}
