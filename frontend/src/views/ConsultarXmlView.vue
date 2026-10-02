<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
import { fetchXmlBlob, fetchCteXmlBlob, fetchNfseXmlBlob } from "../services/api/xml.service";

const accessKey = ref("");
const docType = ref<"nfe" | "cte" | "nfse">("nfe");
const downloading = ref(false);
const message = useMessage();
const NFE_MODELS = ["55", "65"]; // NF-e / NFC-e
const CTE_MODELS = ["57", "67"]; // CT-e / CT-e OS
// NFS-e (padrão nacional) não tem "modelo" na chave como NF-e/CT-e - são 50 dígitos, sem essa
// checagem de modelo (ver API_Sefaz_CCD/docs/protocolo-nfse-sefaz.md)
const ACCESS_KEY_LENGTH = { nfe: 44, cte: 44, nfse: 50 } as const;

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
    const expectedLength = ACCESS_KEY_LENGTH[docType.value];
    if (!new RegExp(`^\\d{${expectedLength}}$`).test(accessKey.value)) {
        message.error(`A chave de acesso precisa ter ${expectedLength} dígitos`);
        return;
    }

    // NFS-e não tem "modelo" na chave (44 vs 50 dígitos já distingue de NF-e/CT-e) - só NF-e/CT-e
    // precisam dessa checagem extra pra não misturar uma chave com a outra
    if (docType.value !== "nfse") {
        const model = getDocumentModel(accessKey.value);
        const expectedModels = docType.value === "cte" ? CTE_MODELS : NFE_MODELS;
        if (!expectedModels.includes(model)) {
            const outroTipo = docType.value === "cte" ? "NF-e" : "CT-e";
            message.error(`Essa chave parece ser de ${outroTipo} (modelo ${model}), não de ${docType.value === "cte" ? "CT-e" : "NF-e"}. Confere o tipo selecionado.`);
            return;
        }
    }

    downloading.value = true;
    try {
        const fetchBlob = docType.value === "cte" ? fetchCteXmlBlob
            : docType.value === "nfse" ? fetchNfseXmlBlob
            : fetchXmlBlob;
        const blob = await fetchBlob(accessKey.value);

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${accessKey.value}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
            <n-form-item label="Tipo de documento">
                <n-radio-group v-model:value="docType" :disabled="downloading">
                    <n-radio-button value="nfe">NF-e</n-radio-button>
                    <n-radio-button value="cte">CT-e</n-radio-button>
                    <n-radio-button value="nfse">NFS-e</n-radio-button>
                </n-radio-group>
            </n-form-item>
            <n-form-item label="Chave de acesso">
                <n-input v-model:value="accessKey" :placeholder="`Chave de acesso (${ACCESS_KEY_LENGTH[docType]} dígitos)`" :disabled="downloading" />
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
