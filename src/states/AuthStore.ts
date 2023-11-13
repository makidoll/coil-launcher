import Avatar from "boring-avatars";
import PocketBase, { RecordAuthResponse, RecordModel } from "pocketbase";
import { renderToString } from "react-dom/server";
import { create } from "zustand";
import { useGameStore } from "./GameStore";

interface AuthState {
	pb: PocketBase;
	loggedIn: boolean;
	username: string;
	avatarUrl: string;
	login: (
		usernameOrEmail: string,
		password: string,
		token?: string,
	) => Promise<{ error: string }>;
	logout: () => Promise<void>;
	autoLogin: () => Promise<{ error: string }>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
	pb: new PocketBase("https://coil.mechanyx.co"),
	loggedIn: false,
	username: "",
	avatarUrl: "",
	login: async (usernameOrEmail, password) => {
		const pb = get().pb;

		// pocket base comes with an auth store that saves to pocketbase_auth

		// TODO: check what happens if you disable users permission in pocketbase

		try {
			let authData: RecordAuthResponse<RecordModel> =
				usernameOrEmail == null
					? await pb.collection("users").authRefresh()
					: await pb
							.collection("users")
							.authWithPassword(usernameOrEmail, password);

			set({
				loggedIn: true,
				username: authData.record.username,
				avatarUrl:
					"data:image/svg+xml;base64," +
					btoa(
						renderToString(
							Avatar({
								size: 128,
								name: authData.record.id,
								square: true,
								variant: "beam",
							}),
						),
					),
			});

			// other things to do after logging in
			(async () => {
				await useGameStore.getState().refreshGames();
			})();

			return { error: "" };
		} catch (error) {
			return { error: error.data.message };
		}
	},
	logout: async () => {
		get().pb.authStore.clear();
		set({ loggedIn: false, username: "" });
	},
	autoLogin: async () => {
		if (localStorage.getItem("pocketbase_auth") == null)
			return { error: "" };

		const res = await get().login(null, null);
		if (res.error) await get().logout();

		return { error: "" };
	},
}));
