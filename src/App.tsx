import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { Game } from "./ApplicationStore";
import TitleBar from "./components/TitleBar";
import GameInfo from "./pages/GameInfo";
import GamesGrid from "./pages/GamesGrid";
import LoginScreen from "./pages/LoginScreen";
import { useAuthStore } from "./AuthStore";

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
				showGoBack={currentGame != null}
			/>
			{auth.loggedIn ? (
				currentGame ? (
					<GameInfo game={currentGame} />
				) : (
					<GamesGrid
						onGame={game => {
							setCurrentGame(game);
						}}
					/>
				)
			) : (
				<LoginScreen />
			)}
		</Flex>
	);
}

export default App;
