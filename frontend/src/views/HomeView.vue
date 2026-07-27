<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSpendingByPeriod, getSpendingByCategory, getSpendingBySupplier } from "../services/api/stats.service";

const currentMonthTotal = ref(0);
const currentYearTotal = ref(0);
const monthlyBars = ref<{ label: string; percent: number; isCurrent: boolean }[]>([]);
const categoryBars = ref<{ label: string; percent: number }[]>([]);
const supplierBars = ref<{ label: string; value: number; percent: number }[]>([]);
const loading = ref(false);

const MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

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
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const [thisYear, lastYear, categories, suppliers] = await Promise.all([
            getSpendingByPeriod(year),
            getSpendingByPeriod(year - 1),
            getSpendingByCategory(),
            getSpendingBySupplier(),
        ]);

        currentMonthTotal.value = thisYear.find((m) => m.month === month)?.total ?? 0;
        currentYearTotal.value = thisYear.reduce((sum, m) => sum + m.total, 0);

        const combined = [
            ...lastYear.map((m) => ({ year: year - 1, month: m.month, total: m.total })),
            ...thisYear.map((m) => ({ year, month: m.month, total: m.total })),
        ];
        const currentIndex = combined.findIndex((m) => m.year === year && m.month === month);
        const last12 = combined.slice(currentIndex - 11, currentIndex + 1);
        const maxMonthly = Math.max(...last12.map((m) => m.total), 1);
        monthlyBars.value = last12.map((m) => ({
            label: MONTH_LABELS[m.month - 1] ?? "",
            percent: Math.round((m.total / maxMonthly) * 100),
            isCurrent: m.year === year && m.month === month,
        }));

        const categoryTotal = categories.reduce((sum, c) => sum + c.total, 0) || 1;
        categoryBars.value = categories.slice(0, 5).map((c) => ({
            label: c.category,
            percent: Math.round((c.total / categoryTotal) * 100),
        }));

        const top5Suppliers = suppliers.slice(0, 5);
        const maxSupplier = top5Suppliers[0]?.total || 1;
        supplierBars.value = top5Suppliers.map((s) => ({
            label: s.supplierName,
            value: s.total,
            percent: Math.round((s.total / maxSupplier) * 100),
        }));
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div>
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

        <div class="panel">
            <div class="panel-title">Gasto por período — últimos 12 meses</div>
            <div class="bars">
                <div
                    v-for="(bar, i) in monthlyBars"
                    :key="i"
                    class="bar"
                    :class="{ current: bar.isCurrent }"
                    :style="{ height: bar.percent + '%' }"
                ></div>
            </div>
            <div class="bar-labels">
                <span v-for="(bar, i) in monthlyBars" :key="i" :class="{ current: bar.isCurrent }">{{ bar.label }}</span>
            </div>
        </div>

        <div class="split">
            <div class="panel">
                <div class="panel-title">Gasto por categoria</div>
                <div class="progress-list">
                    <div v-for="c in categoryBars" :key="c.label" class="progress-row">
                        <div class="progress-head">
                            <span>{{ c.label }}</span>
                            <span class="mono muted">{{ c.percent }}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" :style="{ width: c.percent + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="panel-title">Top 5 fornecedores por gasto</div>
                <div class="progress-list">
                    <div v-for="s in supplierBars" :key="s.label" class="progress-row">
                        <div class="progress-head">
                            <span>{{ s.label }}</span>
                            <span class="mono value">{{ formatCurrency(s.value) }}</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" :style="{ width: s.percent + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>
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

.panel {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 20px;
}

.panel-title {
    font-size: 13.5px;
    font-weight: 600;
    color: #0F172A;
    margin-bottom: 18px;
}

.bars {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 120px;
}

.bar {
    flex: 1;
    background: #EAF1FA;
    border-radius: 3px 3px 0 0;
    min-height: 2px;
}

.bar.current {
    background: #1E4B8C;
}

.bar-labels {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.bar-labels span {
    flex: 1;
    text-align: center;
    font-size: 10.5px;
    color: #94A3B8;
}

.bar-labels span.current {
    font-weight: 600;
    color: #1E4B8C;
}

.split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.progress-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.progress-head {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    margin-bottom: 4px;
}

.progress-head .value {
    color: #0F172A;
    font-weight: 600;
}

.progress-head .muted {
    color: #64748B;
}

.progress-track {
    height: 8px;
    background: #F1F5F9;
    border-radius: 4px;
}

.progress-fill {
    height: 100%;
    background: #1E4B8C;
    border-radius: 4px;
}

.mono {
    font-family: "IBM Plex Mono", monospace;
}
</style>
