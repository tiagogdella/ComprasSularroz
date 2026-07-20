<script setup lang="ts">
import { themeOverrides } from "./theme";
</script>

<template>
    <n-config-provider :theme-overrides="themeOverrides">
        <n-message-provider>
            <router-view />
        </n-message-provider>
    </n-config-provider>
</template>
