import { Center, Flex } from "@chakra-ui/react";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { useEffect, useState } from "react";
import GamesSidebar from "./components/GamesSidebar";
import TitleBar from "./components/TitleBar";
import GameInfo from "./pages/GameInfo";
import SignInScreen from "./pages/SignInScreen";
import { useAuthStore } from "./states/AuthStore";
import { Game } from "./states/GameStore";

export enum UpdateState {
	Checking,
	Downloading,
	NoUpdate,
}

function App() {
	const auth = useAuthStore(({ loggedIn }) => ({ loggedIn }));

	const [currentGame, setCurrentGame] = useState<Game>(null);

	const [updateState, setUpdateState] = useState<UpdateState>(
		UpdateState.Checking,
	);

	useEffect(() => {
		(async () => {
			const update = await check();

			if (update == null) {
				setUpdateState(UpdateState.NoUpdate);
			} else {
				await update.downloadAndInstall();
				await relaunch();
			}
		})();
	}, []);

	return (
		<Flex
			w="100vw"
			h="100vh"
			flexDir={"column"}
			userSelect={"none"}
			overflow={"hidden"}
			borderRadius={"12px"}
			bg="brandBehind.900"
			border={"solid 1px var(--chakra-colors-brandBehind-700)"}
		>
			<TitleBar
				onGoBack={() => {
					setCurrentGame(null);
				}}
				// showGoBack={currentGame != null}
				showGoBack={false}
				loginScreen={!auth.loggedIn}
			/>
			{updateState != UpdateState.NoUpdate ? (
				<Flex w={"100%"} h={"85%"} flexDir={"column"}>
					<Center flexGrow={1}>
						{updateState == UpdateState.Checking
							? "Checking for Coil update..."
							: updateState == UpdateState.Downloading
							? "Downloading Coil update..."
							: ""}
					</Center>
				</Flex>
			) : auth.loggedIn ? (
				<Flex w="100%" h="100%" flexDir={"row"}>
					<GamesSidebar
						onGame={game => {
							setCurrentGame(game);
						}}
						onFirstGameLoaded={game => {
							if (currentGame != null) return;
							setCurrentGame(game);
						}}
						selectedGame={currentGame}
					/>
					{currentGame ? (
						<GameInfo slug={currentGame.slug} />
					) : (
						<></>
						// <GamesGrid
						// 	onGame={game => {
						// 		setCurrentGame(game);
						// 	}}
						// />
					)}
				</Flex>
			) : (
				<SignInScreen />
			)}
		</Flex>
	);
}

export default App;
