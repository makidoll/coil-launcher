import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { Game } from "./ApplicationStore";
import TitleBar from "./components/TitleBar";
import GameInfo from "./pages/GameInfo";
import GamesGrid from "./pages/GamesGrid";
import LoginScreen from "./pages/LoginScreen";

function App() {
	const [currentGame, setCurrentGame] = useState<Game>(null);

	return (
		<Flex
			w="100vw"
			h="100vh"
			flexDir={"column"}
			bg="#222"
			borderRadius={12}
			userSelect={"none"}
			overflow={"hidden"}
		>
			<TitleBar
				onGoBack={() => {
					setCurrentGame(null);
				}}
				showLogo={false}
				showGoBack={currentGame != null}
			/>
			<LoginScreen />
			{/* {currentGame ? (
				<GameInfo game={currentGame} />
			) : (
				<GamesGrid
					onGame={game => {
						setCurrentGame(game);
					}}
				/>
			)} */}
		</Flex>
	);
}

export default App;
