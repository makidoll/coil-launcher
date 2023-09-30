import { Box, Flex, GridItem, Image, Text } from "@chakra-ui/react";

export default function GameButton(props: {
	bg?: string;
	logo?: string;
	name?: string;
	fontSize?: number;
	disabled?: boolean;
}) {
	return (
		<GridItem
			h="114px"
			backgroundImage={props.bg}
			backgroundColor={"rgba(255,255,255,0.3)"}
			backgroundSize={"cover"}
			backgroundPosition={"center"}
			borderRadius={12}
			overflow={"hidden"}
			opacity={props.disabled ? 0.35 : 1}
			_hover={
				props.disabled
					? {}
					: {
							transform: "scale(0.95)",
					  }
			}
			transition={"all 100ms ease-out"}
			cursor={props.disabled ? "default" : "pointer"}
		>
			<Flex w="100%" h="100%" flexDir={"column"} justifyContent={"end"}>
				<Box pl={2} pb={2}>
					{props.name ? (
						props.name.split("\n").map((line, i) => (
							<Text
								key={i}
								fontWeight={700}
								fontSize={props.fontSize ?? 28}
								letterSpacing={"-1px"}
								lineHeight={1.1}
							>
								{line}
							</Text>
						))
					) : (
						<Image src={props.logo} h="25px"></Image>
					)}
				</Box>
				<Flex
					w={"100%"}
					h="24px"
					bg={"rgba(0,0,0,0.5)"}
					alignItems={"center"}
				>
					<Text
						textTransform={"uppercase"}
						fontSize={12}
						fontWeight={900}
						opacity={1}
						mb={-0.5}
						ml={2}
					>
						{props.disabled ? "Coming soon" : "Play now"}
					</Text>
				</Flex>
			</Flex>
		</GridItem>
	);
}
