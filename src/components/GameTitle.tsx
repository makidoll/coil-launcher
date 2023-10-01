import { Image, Text } from "@chakra-ui/react";
import { Game } from "../ApplicationStore";

export default function GameTitle(props: { game: Game }) {
	return props.game.logoUrl ? (
		<Image src={props.game.logoUrl} h="25px" pointerEvents={"none"}></Image>
	) : (
		props.game.name.split("\n").map((line, i) => (
			<Text
				key={i}
				fontWeight={700}
				fontSize={28}
				letterSpacing={"-1px"}
				lineHeight={1.1}
			>
				{line}
			</Text>
		))
	);
}
