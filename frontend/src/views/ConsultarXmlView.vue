<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
import { fetchXmlBlob, fetchCteXmlBlob } from "../services/api/xml.service";

const accessKey = ref("");
const docType = ref<"nfe" | "cte">("nfe");
const downloading = ref(false);
const message = useMessage();
const NFE_MODELS = ["55", "65"]; // NF-e / NFC-e
const CTE_MODELS = ["57", "67"]; // CT-e / CT-e OS

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

function getDocumentModel(key: string): string {
    return key.slice(20, 22); // posições 21-22 (1-indexed) da chave
}

async function handleDownload() {
    if (!/^\d{44}$/.test(accessKey.value)) {
        message.error("A chave de acesso precisa ter 44 dígitos");
        return;
    }

    const model = getDocumentModel(accessKey.value);
    const expectedModels = docType.value === "cte" ? CTE_MODELS : NFE_MODELS;
    if (!expectedModels.includes(model)) {
        const outroTipo = docType.value === "cte" ? "NF-e" : "CT-e";
        message.error(`Essa chave parece ser de ${outroTipo} (modelo ${model}), não de ${docType.value === "cte" ? "CT-e" : "NF-e"}. Confere o tipo selecionado.`);
        return;
    }

    downloading.value = true;
    // ... resto continua igual
}
</script>

<template>
    <n-card title="Consultar XML">
        <n-form @submit.prevent="handleDownload">
            <n-form-item label="Tipo de documento">
                <n-radio-group v-model:value="docType" :disabled="downloading">
                    <n-radio-button value="nfe">NF-e</n-radio-button>
                    <n-radio-button value="cte">CT-e</n-radio-button>
                </n-radio-group>
            </n-form-item>
            <n-form-item label="Chave de acesso">
                <n-input v-model:value="accessKey" placeholder="Chave de acesso (44 dígitos)" :disabled="downloading" />
            </n-form-item>
            <n-button type="primary" attr-type="submit" :loading="downloading" block>
                Baixar XML
            </n-button>
            <Transition name="fade">
                <n-text v-if="downloading" depth="3" class="loading-hint">
                    {{ docType === "cte" ? "Consultando a SEFAZ… CT-e pode levar até um minuto." : "Consultando a SEFAZ…" }}
                </n-text>
            </Transition>
        </n-form>
    </n-card>
</template>

<style scoped>
.loading-hint {
    display: block;
    text-align: center;
    margin-top: 8px;
    font-size: 13px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
