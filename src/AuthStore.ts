import Identicon from "identicon.js";
import PocketBase, { RecordAuthResponse, RecordModel } from "pocketbase";
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

			console.log(authData);

			set({
				loggedIn: true,
				username: authData.record.username,
				avatarUrl:
					"data:image/png;base64," +
					new Identicon(authData.record.id, {
						foreground: [255, 255, 255, 255],
						background: [0, 0, 0, 255],
						margin: 0.2,
						size: 128,
						format: "png",
					}).toString(),
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
