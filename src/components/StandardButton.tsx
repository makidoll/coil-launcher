import { Button, ButtonProps } from "@chakra-ui/react";

export default function StandardButton(props: ButtonProps) {
	return (
		<Button
			{...props}
			background="brand.500"
			fontWeight={900}
			letterSpacing={"0px"}
			color="white"
			textTransform={"uppercase"}
			fontSize={14}
			_hover={{ background: "brand.400" }}
		/>
	);
}
