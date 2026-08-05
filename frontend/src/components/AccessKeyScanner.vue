<script setup lang="ts">
import { ref } from "vue";
import { extractAccessKey, isValidAccessKey } from "../utils/accessKey";

const emit = defineEmits<{
  scanned: [accessKey: string];
}>();

const rawInput = ref("");
const error = ref("");

function handleEnter() {
  const accessKey = extractAccessKey(rawInput.value);

  if (!accessKey || !isValidAccessKey(accessKey)) {
    error.value = "Chave de acesso inválida";
    rawInput.value = "";
    return;
  }

  error.value = "";
  emit("scanned", accessKey);
  rawInput.value = "";
}
</script>

<template>
  <n-form-item label="Escanear código de barras / QR Code">
    <n-input
      v-model:value="rawInput"
      placeholder="Aponte o leitor aqui e escaneie"
      @keyup.enter="handleEnter"
      autofocus
    />
  </n-form-item>
  <n-text v-if="error" type="error">{{ error }}</n-text>
</template>
