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
			ml="1px"
			mt="1px"
			w="calc(100vw - 2px)"
			h="calc(100vh - 2px)"
			flexDir={"column"}
			bg="#222"
			borderRadius={12}
			userSelect={"none"}
			overflow={"hidden"}
			outline={"solid 1px #363636"}
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
