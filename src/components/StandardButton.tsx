import { Button, ButtonProps } from "@chakra-ui/react";

export default function StandardButton(
	props: ButtonProps & { baseWeight?: number; linkButton?: boolean },
) {
	const colorScheme = props.colorScheme ?? "brand";
	const baseWeight = props.baseWeight ?? 500;

	const childProps = { ...props };
	delete childProps.baseWeight;
	delete childProps.linkButton;

	return (
		<Button
			background={
				props.linkButton ? null : colorScheme + "." + baseWeight
			}
			fontWeight={props.linkButton ? 700 : 800}
			letterSpacing={"0px"}
			color="white"
			textTransform={"uppercase"}
			fontSize={14}
			_hover={
				props.linkButton
					? {}
					: { background: colorScheme + "." + (baseWeight - 100) }
			}
			variant={props.linkButton ? "link" : ""}
			colorScheme={props.linkButton ? "white" : ""}
			{...childProps}
		/>
	);
}
