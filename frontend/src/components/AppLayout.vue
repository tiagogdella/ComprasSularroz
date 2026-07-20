<script setup lang="ts">
    import { useRouter } from 'vue-router';
    import { useAuthStore } from '../stores/auth.store';

    const router = useRouter();
    const authStore = useAuthStore();

    const menuOptions = [
        { label: "Início", key: "home"},
        { label: "Nova compra", key: "purchase-new" },
    ];

    function handleMenuSelect(key: string) {
        router.push({ name: key });
    }

    function handleLogout() {
        authStore.logout();
        router.push({ name: "login" });
    }
</script>

<template>
    <n-layout style="height: 100vh;">
        <n-layout-header bordered style="display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 56px;">
            <strong>ComprasSularroz</strong>
            <div>
                <span style="margin-right: 12px;">{{ authStore.user?.name }}</span>
                <n-button size="small" @click="handleLogout">Sair</n-button>
            </div>   
        </n-layout-header>
        <n-layout has-sider style="height: calc(100vh - 56px)">
            <n-layout-sider border width="200">
                <n-menu :options="menuOptions" @update:value="handleMenuSelect" />
            </n-layout-sider>
            <n-layout-content style="padding: 24px;">
                <router-view />
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>