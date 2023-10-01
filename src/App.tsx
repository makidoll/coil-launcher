import { Flex, Grid } from "@chakra-ui/react";
import GameButton from "./GameButton";
import TitleBar from "./TitleBar";
import essenceBgImage from "./images/essence-bg-darker.png";
import essenceTextImage from "./images/essence-text.png";

function App() {
	return (
		<Flex
			w="100vw"
			h="100vh"
			flexDir={"column"}
			bg="#111"
			borderRadius={12}
			userSelect={"none"}
			overflow={"hidden"}
			// pointerEvents={"none"}
		>
			<TitleBar />
			<Grid
				w="100%"
				templateColumns="repeat(3, 1fr)"
				gap={2}
				p={2}
				mt={-2}
			>
				<GameButton bg={essenceBgImage} logo={essenceTextImage} />
				<GameButton name={"Unknown"} disabled />
			</Grid>
		</Flex>
	);
}

export default App;
