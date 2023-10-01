import { create } from "zustand";
import essenceBg from "./images/essence-bg-darker.png";
import essenceLogo from "./images/essence-text.png";

export interface Game {
	name: string;
	bgUrl: string;
	logoUrl: string;
	available: boolean;
}

interface ApplicationState {
	games: Game[];
}

export const useApplicationStore = create<ApplicationState>()(set => ({
	games: [
		{
			name: "Unknown",
			bgUrl: "",
			logoUrl: "",
			available: false,
		},
		{
			name: "Unknown",
			bgUrl: "",
			logoUrl: "",
			available: false,
		},
		{
			name: "Unknown",
			bgUrl: "",
			logoUrl: "",
			available: false,
		},
		{
			name: "Essence",
			bgUrl: essenceBg,
			logoUrl: essenceLogo,
			available: true,
		},
		{
			name: "Unknown",
			bgUrl: "",
			logoUrl: "",
			available: false,
		},
	],
}));
