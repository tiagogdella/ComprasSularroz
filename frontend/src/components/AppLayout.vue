<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const menuOptions = [
  {
    key: 'home',
    label: 'Início',
    icon: 'M4 19V10M10 19V5M16 19v-7M4 19h16',
  },
  {
    key: 'purchase-new',
    label: 'Nova Compra',
    icon: 'M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z|M9 13h6M12 10v6',
  },
  // Histórico de Compras entra aqui no Dia 21, junto com a rota
];

function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">ComprasSularroz</div>
      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuOptions"
          :key="item.key"
          :to="{ name: item.key }"
          class="nav-item"
          :class="{ active: route.name === item.key }"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <path v-for="(d, i) in item.icon.split('|')" :key="i" :d="d" />
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="sidebar-footer">v1.0 · Sularroz</div>
    </aside>

    <div class="main">
      <header class="header">
        <div class="page-title">{{ String(route.meta.title ?? '') }}</div>
        <div class="header-user">
          <span>{{ authStore.user?.name }}</span>
          <button class="logout-btn" @click="handleLogout">Sair</button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #F7F9FB;
}

.sidebar {
  width: 216px;
  background: #12233F;
  color: #CBD5E1;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-brand {
  padding: 18px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border-left: 3px solid transparent;
  color: #CBD5E1;
  text-decoration: none;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-left-color: #C2740A;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11.5px;
  color: #64748B;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.page-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: #334155;
}

.logout-btn {
  background: #fff;
  color: #334155;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 32px;
  overflow: auto;
}
</style>
