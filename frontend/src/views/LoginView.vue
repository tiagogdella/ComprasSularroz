<script setup lang="ts">
import {ref} from "vue";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import { useAuthStore } from "../stores/auth.store";

const login = ref("");
const password = ref("");
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const message = useMessage();

async function handleSubmit() {
    loading.value = true;
    try {
        await authStore.login(login.value, password.value);
        message.success("login realizado com sucesso");
        router.push("/");
    } catch {
        message.error("Login ou senha inválidos");
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <n-card title="login" style="max-width: 360px; margin: 80px auto;">
        <n-form @submit.prevent="handleSubmit">
            <n-form-item label="Login">
                <n-input v-model:value="login" placeholder="seu usuário" />    
            </n-form-item>
            <n-form-item label="Senha">
                <n-input v-model:value="password" type="password" placeholder="sua senha" />
            </n-form-item>
            <n-button type="primary" attr-type="submit" :loading="loading" block>
                Entrar
            </n-button>
        </n-form>    
    </n-card>
</template>