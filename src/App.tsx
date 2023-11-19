import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import GamesSidebar from "./components/GamesSidebar";
import TitleBar from "./components/TitleBar";
import { useAuthStore } from "./states/AuthStore";
import { Game } from "./states/GameStore";
import GameInfo from "./pages/GameInfo";
import GamesGrid from "./pages/GamesGrid";
import SignInScreen from "./pages/SignInScreen";

function App() {
	const auth = useAuthStore(({ loggedIn }) => ({ loggedIn }));

	const [currentGame, setCurrentGame] = useState<Game>(null);

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
			{auth.loggedIn ? (
				<Flex w="100%" h="100%" flexDir={"row"}>
					<GamesSidebar
						onGame={game => {
							setCurrentGame(game);
						}}
						onFirstGameLoaded={game => {
							if (currentGame != null) return;
							setCurrentGame(game);
						}}
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
