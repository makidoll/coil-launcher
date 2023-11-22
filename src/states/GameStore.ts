import { invoke, shell } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { platform } from "@tauri-apps/api/os";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAuthStore } from "./AuthStore";

interface InstalledStore {
	games: { [slug: string]: string };
}

const useInstalledStore = create<InstalledStore>()(
	persist(
		set => ({
			games: {},
		}),
		{
			name: "installed",
			storage: createJSONStorage(() => localStorage),
		},
	),
);

export enum GameInstallState {
	Install = "install",
	Update = "update",
	Play = "play",
}

export interface Game {
	name: string;
	slug: string;
	iconUrl: string;
	logoUrl: string;
	backgroundUrl: string;
	description: string;
	available: boolean;
	installState: GameInstallState;
	installed: {
		path: string;
		version?: string;
	};
	latest?: {
		version: string;
		downloadUrl: string;
	};
}

interface GameStore {
	games: Game[];
	installing: { [slug: string]: number };
	refreshGames: () => Promise<any>;
}

async function getLatestBuildForOS(gameId: string) {
	const pb = useAuthStore.getState().pb;

	let urlField = "";
	const currentPlatform = await platform();
	if (currentPlatform == "win32") urlField = "windowsBuild";
	else if (currentPlatform == "linux") urlField = "linuxBuild";
	if (urlField == "") throw new Error("OS not supported");

	try {
		const build = await pb
			.collection("launcher_game_builds")
			.getFirstListItem(`game="${gameId}" && ${urlField} != ""`, {
				sort: "-created",
			});

		return {
			version: build.version,
			downloadUrl: pb.files.getUrl(build, build[urlField]),
		};
	} catch (error) {
		return null;
	}
}

export const useGameStore = create<GameStore>()(set => ({
	games: [],
	installing: {},
	refreshGames: async () => {
		const pb = useAuthStore.getState().pb;
		const gamesCollection = await pb
			.collection("launcher_games")
			.getFullList();

		const installedGames = useInstalledStore.getState().games;

		const gamesPromises = gamesCollection.map(async record => {
			const latest = await getLatestBuildForOS(record.id);
			const version = installedGames[record.slug];

			const installState =
				version == null
					? GameInstallState.Install
					: latest.version != version
					? GameInstallState.Update
					: GameInstallState.Play;

			const game: Game = {
				name: record.name,
				slug: record.slug,
				iconUrl: pb.files.getUrl(record, record.icon),
				logoUrl: pb.files.getUrl(record, record.logo),
				backgroundUrl: pb.files.getUrl(record, record.background),
				description: record.description,
				available: record.available,
				installState,
				installed: {
					path: await invoke("get_install_path", {
						slug: record.slug,
					}),
					version,
				},
				latest,
			};
			return game;
		});

		const games = await Promise.all(gamesPromises);

		set({ games });
	},
}));

export async function installOrUpdateGame(game: Game) {
	const updatePercentage = (percentage: number) => {
		const installing = useGameStore.getState().installing;
		if (percentage == null) {
			delete installing[game.slug];
		} else {
			installing[game.slug] = percentage;
		}
		useGameStore.setState({
			installing,
		});
	};

	updatePercentage(0);

	const unlisten = await listen<{ slug: string; percentage: number }>(
		"download-progress",
		event => {
			if (event.payload.slug != game.slug) return;
			updatePercentage(event.payload.percentage);
		},
	);

	// TODO: catch errors

	await invoke("install_or_update_game", {
		slug: game.slug,
		downloadUrl: game.latest.downloadUrl,
	});

	unlisten();

	updatePercentage(null);

	// update installed version

	{
		const games = useInstalledStore.getState().games;
		games[game.slug] = game.latest.version;
		useInstalledStore.setState({ games });
	}

	// refresh games

	useGameStore.getState().refreshGames();
}

export async function deleteGame(game: Game) {
	try {
		await invoke("delete_game", {
			slug: game.slug,
		});
	} catch (error) {}

	{
		const games = useInstalledStore.getState().games;
		delete games[game.slug];
		useInstalledStore.setState({ games });
	}

	useGameStore.getState().refreshGames();
}

export async function launchGame(game: Game) {
	await invoke("launch_game", {
		slug: game.slug,
		authToken: useAuthStore.getState().pb.authStore.token,
	});
}

export async function openGameFolder(game: Game) {
	shell.open("file://" + game.installed.path);
}
