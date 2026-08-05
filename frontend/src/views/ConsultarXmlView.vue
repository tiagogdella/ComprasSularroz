<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
import { fetchXmlBlob } from "../services/api/xml.service";

const accessKey = ref("");
const downloading = ref(false);
const message = useMessage();

async function extractErrorMessage(error: any): Promise<string> {
    if (error.response?.data instanceof Blob) {
        try {
            const text = await error.response.data.text();
            return JSON.parse(text).message ?? "Erro ao buscar o XML";
        } catch {
            return "Erro ao buscar o XML";
        }
    }
    return "Erro ao buscar o XML";
}

async function handleDownload() {
    if (!/^\d{44}$/.test(accessKey.value)) {
        message.error("A chave de acesso precisa ter 44 dígitos");
        return;
    }

    downloading.value = true;
    try {
        const blob = await fetchXmlBlob(accessKey.value);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${accessKey.value}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        message.success("XML baixado com sucesso");
    } catch (error: any) {
        message.error(await extractErrorMessage(error));
    } finally {
        downloading.value = false;
    }
}
</script>

<template>
    <n-card title="Consultar XML">
        <n-form @submit.prevent="handleDownload">
            <n-form-item label="Chave de acesso">
                <n-input v-model:value="accessKey" placeholder="Chave de acesso (44 dígitos)" />
            </n-form-item>
            <n-button type="primary" attr-type="submit" :loading="downloading" block>
                Baixar XML
            </n-button>
        </n-form>
    </n-card>
</template>
