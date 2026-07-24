<script setup lang="ts">
import { ref, watch } from "vue";
import { listProducts, getProductHistory, type Product, type ProductHistoryItem } from "../services/api/product.service";

const query = ref("");
const suggestions = ref<Product[]>([]);
const showSuggestions = ref(false);
const selectedProduct = ref<Product | null>(null);
const history = ref<ProductHistoryItem[]>([]);
const loading = ref(false);

let justSelected = false;
let debounceHandle: ReturnType<typeof setTimeout> | null = null;

watch(query, (value) => {
    if (justSelected) {
        justSelected = false;
        return;
    }
    selectedProduct.value = null;
    history.value = [];
    if (debounceHandle) clearTimeout(debounceHandle);
    if (!value.trim()) {
        suggestions.value = [];
        showSuggestions.value = false;
        return;
    }
    debounceHandle = setTimeout(async () => {
        suggestions.value = await listProducts(value);
        showSuggestions.value = true;
    }, 300);
});

async function selectProduct(product: Product) {
    justSelected = true;
    query.value = product.name;
    showSuggestions.value = false;
    selectedProduct.value = product;

    loading.value = true;
    try {
        const result = await getProductHistory(product.id);
        history.value = result.history;
    } finally {
        loading.value = false;
    }
}

function formatCurrency(value: string) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
</script>

<template>
    <div>
        <div class="autocomplete search-box">
            <input
                type="text"
                placeholder="Buscar peça pelo nome..."
                v-model="query"
                @focus="showSuggestions = suggestions.length > 0"
            />
            <div v-if="showSuggestions && suggestions.length" class="suggestions">
                <div
                    v-for="p in suggestions"
                    :key="p.id"
                    class="suggestion-item"
                    @mousedown.prevent="selectProduct(p)"
                >
                    {{ p.name }} <span class="muted">· {{ p.category }}</span>
                </div>
            </div>
        </div>

        <div v-if="selectedProduct" class="product-card">
            <div class="product-name">{{ selectedProduct.name }}</div>
            <div class="product-meta">
                <span class="tag">{{ selectedProduct.category }}</span>
                <span class="tag">{{ selectedProduct.unit }}</span>
            </div>
            <div v-if="selectedProduct.specification" class="product-spec">{{ selectedProduct.specification }}</div>
        </div>

        <div v-if="loading" class="empty">Carregando...</div>
        <div v-else-if="selectedProduct && history.length === 0" class="empty">
            Nenhuma compra registrada para essa peça ainda.
        </div>

        <div v-else class="timeline">
            <div v-for="item in history" :key="item.id" class="timeline-item">
                <div class="timeline-date mono">{{ formatDate(item.purchase.issueDate) }}</div>
                <div class="timeline-body">
                    <div class="timeline-supplier">{{ item.purchase.supplier.name }}</div>
                    <div class="timeline-details muted">
                        {{ Number(item.quantity) }} × {{ formatCurrency(item.unitPrice) }} · nota {{ item.purchase.invoiceNumber }}
                    </div>
                </div>
                <div class="timeline-total mono bold">{{ formatCurrency(item.totalPrice) }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-box {
    position: relative;
    margin-bottom: 20px;
}

.search-box input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
}

.suggestions {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
    z-index: 5;
    max-height: 240px;
    overflow: auto;
}

.suggestion-item {
    padding: 10px 14px;
    font-size: 13px;
    cursor: pointer;
}

.suggestion-item:hover {
    background: #F7F9FB;
}

.product-card {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 20px;
}

.product-name {
    font-size: 16px;
    font-weight: 600;
    color: #0F172A;
    margin-bottom: 8px;
}

.product-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.tag {
    background: #EAF1FA;
    color: #1E4B8C;
    border-radius: 4px;
    padding: 3px 9px;
    font-size: 11.5px;
    font-weight: 500;
}

.product-spec {
    font-size: 13px;
    color: #64748B;
}

.empty {
    padding: 24px;
    text-align: center;
    color: #64748B;
    font-size: 13px;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: #E2E8F0;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    overflow: hidden;
}

.timeline-item {
    background: #fff;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.timeline-date {
    width: 90px;
    font-size: 12.5px;
    color: #334155;
    flex-shrink: 0;
}

.timeline-body {
    flex: 1;
}

.timeline-supplier {
    font-size: 13.5px;
    color: #0F172A;
}

.timeline-details {
    font-size: 12px;
    margin-top: 2px;
}

.timeline-total {
    font-size: 13.5px;
}

.mono {
    font-family: "IBM Plex Mono", monospace;
}

.muted {
    color: #64748B;
}

.bold {
    font-weight: 600;
}
</style>
