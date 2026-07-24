import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import AppLoyout from "../components/AppLayout.vue";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import PurchaseFormView from "../views/PurchaseFormView.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/login", name: "login", component: LoginView },
        {
            path: "/",
            component: AppLoyout,
            children: [
                { path: "", name: "home", component: HomeView, meta: { title: "Início" } },
                { path: "purchases/new", name: "purchase-new", component: PurchaseFormView, meta: { title: "Nova Compra" } },
            ],
        },
    ],
});

router.beforeEach((to) => {
    const authStore = useAuthStore();

    if ( to.name !== "login" && !authStore.isAuthenticated) {
        return { name: "login" };
    }

    if ( to.name === "login" && authStore.isAuthenticated) {
        return { name: "home" };
    }
});