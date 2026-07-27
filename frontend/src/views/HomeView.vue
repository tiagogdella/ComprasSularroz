<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSpendingByPeriod } from "../services/api/stats.service";

const currentMonthTotal = ref(0);
const currentYearTotal = ref(0);
const loading = ref(false);

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function monthLabel() {
    return new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

onMounted(async () => {
    loading.value = true;
    try {
        const now = new Date();
        const byMonth = await getSpendingByPeriod(now.getFullYear());
        currentMonthTotal.value = byMonth.find((m) => m.month === now.getMonth() + 1)?.total ?? 0;
        currentYearTotal.value = byMonth.reduce((sum, m) => sum + m.total, 0);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="cards">
        <div class="card">
            <div class="card-label">Mês atual ({{ monthLabel() }})</div>
            <div class="card-value">{{ formatCurrency(currentMonthTotal) }}</div>
        </div>
        <div class="card">
            <div class="card-label">Ano atual ({{ new Date().getFullYear() }})</div>
            <div class="card-value">{{ formatCurrency(currentYearTotal) }}</div>
        </div>
    </div>
</template>

<style scoped>
.cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    max-width: 520px;
}

.card {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 18px 20px;
}

.card-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.card-value {
    font-size: 26px;
    font-weight: 600;
    color: #0F172A;
    margin-top: 8px;
    font-family: "IBM Plex Mono", monospace;
}
</style>
