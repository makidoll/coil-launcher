import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import TitleBar from "./components/TitleBar";
import GameInfo from "./pages/GameInfo";
import GamesGrid from "./pages/GamesGrid";
import SignInScreen from "./pages/SignInScreen";
import { useAuthStore } from "./states/AuthStore";
import { Game } from "./states/GameStore";

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
					<GameInfo slug={currentGame.slug} />
				) : (
					<GamesGrid
						onGame={game => {
							setCurrentGame(game);
						}}
					/>
				)
			) : (
				<SignInScreen />
			)}
		</Flex>
	);
}

export default App;
