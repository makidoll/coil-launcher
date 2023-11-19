import { Image, Text } from "@chakra-ui/react";
import { Game } from "../states/GameStore";

export default function GameTitle(props: { game: Game; h?: string }) {
	return props.game.logoUrl ? (
		<Image
			src={props.game.logoUrl}
			h={props.h ?? "24px"}
			pointerEvents={"none"}
		></Image>
	) : (
		props.game.name.split("\n").map((line, i) => (
			<Text
				key={i}
				fontWeight={700}
				fontSize={36}
				letterSpacing={"-1px"}
				lineHeight={1.1}
			>
				{line}
			</Text>
		))
	);
}
