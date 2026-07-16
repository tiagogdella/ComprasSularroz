import { defineStore } from "pinia";
import { http } from "../services/api/http";

interface AuthUser {
    id: number;
    name: string;
    login: string;
}

interface LoginResponse {
    token: string;
    user: AuthUser;
}

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: localStorage.getItem("token"),
        user: JSON.parse(localStorage.getItem("user") ?? "null") as AuthUser | null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(login: string, password: string) {
            const { data } = await http.post<LoginResponse>("/auth/login", { login, password });
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
    },
});