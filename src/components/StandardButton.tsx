import { Button, ButtonProps } from "@chakra-ui/react";

export default function StandardButton(
	props: ButtonProps & { baseWeight?: number },
) {
	const colorScheme = props.colorScheme ?? "brand";
	const baseWeight = props.baseWeight ?? 500;
	return (
		<Button
			background={colorScheme + "." + baseWeight}
			fontWeight={900}
			letterSpacing={"0px"}
			color="white"
			textTransform={"uppercase"}
			fontSize={14}
			_hover={{ background: colorScheme + "." + (baseWeight - 100) }}
			{...props}
		/>
	);
}
