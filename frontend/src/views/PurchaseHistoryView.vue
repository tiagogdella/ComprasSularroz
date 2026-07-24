<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { listPurchases, type PurchaseListItem, type ListPurchasesResponse } from "../services/api/purchase.service";
import { listSuppliers, type Supplier } from "../services/api/supplier.service";
import { listProducts, type Product } from "../services/api/product.service";

const purchases = ref<PurchaseListItem[]>([]);
const meta = ref<ListPurchasesResponse["meta"]>({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
const loading = ref(false);

const suppliers = ref<Supplier[]>([]);
const allProducts = ref<Product[]>([]);
const categories = ref<string[]>([]);

const startDate = ref("");
const endDate = ref("");
const supplierId = ref<number | null>(null);
const category = ref("");
const productQuery = ref("");
const productId = ref<number | null>(null);
const productSuggestions = ref<Product[]>([]);
const showSuggestions = ref(false);
const page = ref(1);

const selectedRow = ref<PurchaseListItem | null>(null);

let justSelected = false;
let debounceHandle: ReturnType<typeof setTimeout> | null = null;

watch(productQuery, (value) => {
    if (justSelected) {
        justSelected = false;
        return;
    }
    productId.value = null;
    if (debounceHandle) clearTimeout(debounceHandle);
    if (!value.trim()) {
        productSuggestions.value = [];
        showSuggestions.value = false;
        return;
    }
    debounceHandle = setTimeout(async () => {
        productSuggestions.value = await listProducts(value);
        showSuggestions.value = true;
    }, 300);
});

function selectProduct(product: Product) {
    justSelected = true;
    productId.value = product.id;
    productQuery.value = product.name;
    showSuggestions.value = false;
}

function clearFilters() {
    startDate.value = "";
    endDate.value = "";
    supplierId.value = null;
    category.value = "";
    productQuery.value = "";
    productId.value = null;
    page.value = 1;
    fetchPurchases();
}

async function fetchPurchases() {
    loading.value = true;
    try {
        const result = await listPurchases({
            page: page.value,
            pageSize: 20,
            startDate: startDate.value || undefined,
            endDate: endDate.value || undefined,
            supplierId: supplierId.value ?? undefined,
            category: category.value || undefined,
            productId: productId.value ?? undefined,
        });
        purchases.value = result.data;
        meta.value = result.meta;
    } finally {
        loading.value = false;
    }
}

function goToPage(p: number) {
    page.value = p;
    fetchPurchases();
}

function rowCategory(row: PurchaseListItem) {
    const cats = [...new Set(row.items.map((it) => it.product.category))];
    return cats.length > 1 ? "Diversos" : (cats[0] ?? "-");
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function openDrawer(row: PurchaseListItem) {
    selectedRow.value = row;
}

function closeDrawer() {
    selectedRow.value = null;
}

onMounted(async () => {
    const [supplierList, productList] = await Promise.all([listSuppliers(), listProducts()]);
    suppliers.value = supplierList;
    allProducts.value = productList;
    categories.value = [...new Set(productList.map((p) => p.category))];
    fetchPurchases();
});
</script>

<template>
    <div>
        <div class="filters">
            <div class="filter-field">
                <label>De</label>
                <input type="date" v-model="startDate" />
            </div>
            <div class="filter-field">
                <label>Até</label>
                <input type="date" v-model="endDate" />
            </div>
            <div class="filter-field">
                <label>Fornecedor</label>
                <select v-model="supplierId">
                    <option :value="null">Todos</option>
                    <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
            </div>
            <div class="filter-field">
                <label>Categoria</label>
                <select v-model="category">
                    <option value="">Todas</option>
                    <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                </select>
            </div>
            <div class="filter-field filter-field-grow">
                <label>Produto</label>
                <div class="autocomplete">
                    <input
                        type="text"
                        placeholder="Buscar produto na nota..."
                        v-model="productQuery"
                        @focus="showSuggestions = productSuggestions.length > 0"
                    />
                    <div v-if="showSuggestions && productSuggestions.length" class="suggestions">
                        <div
                            v-for="p in productSuggestions"
                            :key="p.id"
                            class="suggestion-item"
                            @mousedown.prevent="selectProduct(p)"
                        >
                            {{ p.name }}
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn-primary" @click="page = 1; fetchPurchases();">Buscar</button>
            <a href="#" class="link-clear" @click.prevent="clearFilters">Limpar</a>
        </div>

        <div class="table">
            <div class="table-head">
                <div>Nota</div>
                <div>Data</div>
                <div>Fornecedor</div>
                <div>Categoria</div>
                <div>Itens</div>
                <div class="align-right">Valor</div>
                <div>Lançado por</div>
            </div>
            <div
                v-for="row in purchases"
                :key="row.id"
                class="table-row"
                :class="{ selected: selectedRow?.id === row.id }"
                @click="openDrawer(row)"
            >
                <div class="mono">{{ row.invoiceNumber }}</div>
                <div class="mono muted">{{ formatDate(row.issueDate) }}</div>
                <div>{{ row.supplier.name }}</div>
                <div class="muted">{{ rowCategory(row) }}</div>
                <div class="muted">{{ row.items.length }}</div>
                <div class="align-right mono bold">{{ formatCurrency(Number(row.totalAmount)) }}</div>
                <div class="muted">{{ row.user.name }}</div>
            </div>
            <div v-if="!loading && purchases.length === 0" class="empty">Nenhuma compra encontrada.</div>
        </div>

        <div class="pagination">
            <span class="pagination-count">{{ meta.total }} compras encontradas</span>
            <div class="pagination-buttons">
                <button
                    v-for="p in meta.totalPages"
                    :key="p"
                    class="page-btn"
                    :class="{ active: p === meta.page }"
                    @click="goToPage(p)"
                >
                    {{ p }}
                </button>
            </div>
        </div>

        <div v-if="selectedRow" class="drawer-overlay" @click="closeDrawer"></div>
        <div v-if="selectedRow" class="drawer">
            <div class="drawer-header">
                <div>
                    <div class="drawer-label">Nota</div>
                    <div class="drawer-title">{{ selectedRow.invoiceNumber }}</div>
                </div>
                <button class="drawer-close" @click="closeDrawer">×</button>
            </div>
            <div class="drawer-body">
                <div class="drawer-tags">
                    <span class="tag tag-neutral">{{ formatDate(selectedRow.issueDate) }}</span>
                    <span class="tag tag-primary">{{ selectedRow.entryMethod === "MANUAL" ? "Manual" : "Escaneada" }}</span>
                </div>

                <div class="drawer-section-label">Fornecedor</div>
                <div class="drawer-supplier">
                    <div class="drawer-supplier-name">{{ selectedRow.supplier.name }}</div>
                    <div class="drawer-supplier-meta">{{ selectedRow.supplier.taxId }}</div>
                    <div class="drawer-supplier-meta" v-if="selectedRow.supplier.contact">{{ selectedRow.supplier.contact }}</div>
                </div>

                <div class="drawer-section-label">Itens</div>
                <div v-for="it in selectedRow.items" :key="it.id" class="drawer-item">
                    <div>
                        <div class="drawer-item-name">{{ it.product.name }}</div>
                        <div class="drawer-item-qty">{{ Number(it.quantity) }} × {{ formatCurrency(Number(it.unitPrice)) }}</div>
                    </div>
                    <div class="drawer-item-total">{{ formatCurrency(Number(it.totalPrice)) }}</div>
                </div>

                <div class="drawer-total">
                    <div>Total da nota</div>
                    <div class="drawer-total-value">{{ formatCurrency(Number(selectedRow.totalAmount)) }}</div>
                </div>
                <div class="drawer-issuer">Lançado por {{ selectedRow.user.name }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.filters {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.filter-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #64748B;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.filter-field input,
.filter-field select {
    box-sizing: border-box;
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    padding: 7px 10px;
    font-size: 12.5px;
    font-family: inherit;
    color: #0F172A;
    outline: none;
    background: #fff;
}

.filter-field input[type="date"] {
    width: 140px;
    font-family: "IBM Plex Mono", monospace;
}

.filter-field-grow {
    flex: 1;
    min-width: 180px;
    position: relative;
}

.filter-field-grow input {
    width: 100%;
}

.autocomplete {
    position: relative;
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
    max-height: 200px;
    overflow: auto;
}

.suggestion-item {
    padding: 8px 12px;
    font-size: 12.5px;
    cursor: pointer;
}

.suggestion-item:hover {
    background: #F7F9FB;
}

.btn-primary {
    background: #1E4B8C;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 12.5px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
}

.link-clear {
    font-size: 12px;
    padding-bottom: 8px;
    color: #64748B;
}

.table {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    overflow: hidden;
}

.table-head,
.table-row {
    display: grid;
    grid-template-columns: 0.8fr 0.8fr 1.6fr 1fr 0.6fr 1fr 0.9fr;
    padding: 10px 16px;
}

.table-head {
    background: #F7F9FB;
    padding: 9px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.table-row {
    font-size: 13px;
    border-top: 1px solid #F1F5F9;
    cursor: pointer;
}

.table-row:hover {
    background: #F7F9FB;
}

.table-row.selected {
    background: #EAF1FA;
}

.mono {
    font-family: "IBM Plex Mono", monospace;
}

.muted {
    color: #334155;
}

.bold {
    font-weight: 600;
}

.align-right {
    text-align: right;
}

.empty {
    padding: 24px;
    text-align: center;
    color: #64748B;
    font-size: 13px;
}

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
}

.pagination-count {
    font-size: 12px;
    color: #64748B;
}

.pagination-buttons {
    display: flex;
    gap: 6px;
}

.page-btn {
    width: 30px;
    height: 30px;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    background: #fff;
    color: #334155;
    font-size: 12.5px;
    font-family: "IBM Plex Mono", monospace;
    cursor: pointer;
}

.page-btn.active {
    background: #1E4B8C;
    color: #fff;
    border-color: #1E4B8C;
}

.drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.3);
    z-index: 10;
}

.drawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 420px;
    background: #fff;
    box-shadow: -8px 0 24px rgba(15, 23, 42, 0.12);
    z-index: 11;
    display: flex;
    flex-direction: column;
}

.drawer-header {
    padding: 20px 24px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.drawer-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.drawer-title {
    font-size: 17px;
    font-weight: 600;
    color: #0F172A;
    font-family: "IBM Plex Mono", monospace;
}

.drawer-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748B;
    font-size: 20px;
    line-height: 1;
}

.drawer-body {
    padding: 20px 24px;
    overflow: auto;
    flex: 1;
}

.drawer-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
}

.tag {
    border-radius: 4px;
    padding: 3px 9px;
    font-size: 11.5px;
    font-weight: 500;
}

.tag-neutral {
    background: #F1F5F9;
    color: #334155;
}

.tag-primary {
    background: #EAF1FA;
    color: #1E4B8C;
}

.drawer-section-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 8px;
}

.drawer-supplier {
    background: #F7F9FB;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 20px;
}

.drawer-supplier-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #0F172A;
}

.drawer-supplier-meta {
    font-size: 12px;
    color: #64748B;
    margin-top: 4px;
}

.drawer-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 9px 0;
    border-bottom: 1px solid #F1F5F9;
}

.drawer-item-name {
    font-size: 13px;
    color: #0F172A;
}

.drawer-item-qty {
    font-size: 11.5px;
    color: #94A3B8;
}

.drawer-item-total {
    font-size: 13px;
    font-weight: 600;
    font-family: "IBM Plex Mono", monospace;
}

.drawer-total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-top: 16px;
    margin-top: 8px;
}

.drawer-total-value {
    font-size: 19px;
    font-weight: 600;
    font-family: "IBM Plex Mono", monospace;
}

.drawer-issuer {
    font-size: 11.5px;
    color: #94A3B8;
    margin-top: 10px;
}
</style>
