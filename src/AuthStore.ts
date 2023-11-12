import Avatar from "boring-avatars";
import PocketBase, { RecordAuthResponse, RecordModel } from "pocketbase";
import { renderToString } from "react-dom/server";
import { create } from "zustand";

const pb = new PocketBase("https://coil.mechanyx.co");

interface AuthState {
	loggedIn: boolean;
	username: string;
	avatarUrl: string;
	token: string;
	login: (
		usernameOrEmail: string,
		password: string,
		token?: string,
	) => Promise<{ error: string }>;
	logout: () => Promise<void>;
	autoLogin: () => Promise<{ error: string }>;
}

const AUTH_TOKEN_KEY = "authToken";

export const useAuthStore = create<AuthState>()((set, get) => ({
	loggedIn: false,
	username: "",
	avatarUrl: "",
	token: "",
	login: async (usernameOrEmail, password, token) => {
		try {
			let authData: RecordAuthResponse<RecordModel>;

			// check what happens if you disable users permission in pocketbase

			if (token == null) {
				authData = await pb
					.collection("users")
					.authWithPassword(usernameOrEmail, password);
			} else {
				pb.authStore.save(token);
				authData = await pb.collection("users").authRefresh();
			}

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
				token: authData.token,
			});

			localStorage.setItem(AUTH_TOKEN_KEY, authData.token);

			return { error: "" };
		} catch (error) {
			return { error: error.data.message };
		}
	},
	logout: async () => {
		set({ loggedIn: false, username: "", token: "" });

		localStorage.setItem(AUTH_TOKEN_KEY, "");
	},
	autoLogin: async () => {
		const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!authToken) return { error: "" };

		const res = await get().login(null, null, authToken);

		if (res.error) await get().logout();

		return res;
	},
}));
