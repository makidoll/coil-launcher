import { create } from "zustand";
import PocketBase from "pocketbase";

const pb = new PocketBase("https://coil.mechanyx.co");

interface AuthState {
	loggedIn: boolean;
	username: string;
	token: string;
	loginWithPassword: (
		usernameOrEmail: string,
		password: string,
	) => Promise<{ error: string }>;
}

export const useAuthStore = create<AuthState>()(set => ({
	loggedIn: false,
	username: "",
	token: "",
	loginWithPassword: async (usernameOrEmail, password) => {
		try {
			const authData = await pb
				.collection("users")
				.authWithPassword(usernameOrEmail, password);

			console.log(authData);

			set({
				token: authData.token,
				username: authData.record.username,
				loggedIn: true,
			});

			return { error: "" };
		} catch (error) {
			return { error: error.data.message };
		}
	},
	// loginWithToken
}));
