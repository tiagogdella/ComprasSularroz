<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useMessage } from "naive-ui";
import { createSupplier, listSuppliers, type Supplier, type CreateSupplierInput } from "../services/api/supplier.service";
import { createProduct, listProducts, type Product, type CreateProductInput } from "../services/api/product.service";
import { useEntityPicker } from "../composables/useEntityPicker";
import { useAuthStore } from "../stores/auth.store";
import { createPurchase } from "../services/api/purchase.service";

const message = useMessage();

const supplierPicker = useEntityPicker<Supplier, CreateSupplierInput>(listSuppliers, createSupplier);
const productPicker = useEntityPicker<Product, CreateProductInput>(listProducts, createProduct);
const supplierId = ref<number | null>(null);
const invoiceNumber = ref("");
const issueDate = ref<number | null>(null);
const entryMethod = ref<"MANUAL" | "SCANNED">("MANUAL");
const authStore = useAuthStore();
const submitting = ref(false);

const entryMethodOptions = [
    { label: "Manual", value: "MANUAL" },
    { label: "Escameada", value: "SCANNED" },
];

const newSupplierName = ref("");
const newSupplierTaxId = ref("");
const newSupplierContact = ref("");

const newProductName = ref("");
const newProductCategory = ref("");
const newProductUnit = ref("");
const newProductSpecification = ref("");

const activeItemIndex = ref<number | null>(null);

onMounted(() => {
    supplierPicker.load();
    productPicker.load();   
});

interface PurchaseItemForm {
    productId: number | null;
    quantity: number | null;
    unitPrice: number | null;
}

const items = ref<PurchaseItemForm[]>([]);

function addItem() {
    items.value.push({ productId: null, quantity: null, unitPrice: null });
}

function removeItem(index: number){
    items.value.splice(index, 1);
}

function itemTotal(item: PurchaseItemForm) {
    return (item.quantity ?? 0) * (item.unitPrice ?? 0);
}

const grandTotal = computed(() => 
    items.value.reduce((sum, item) => sum + itemTotal(item), 0)
);

async function handleCreateSupplier() {
    try {
        const supplier = await supplierPicker.create({
            name: newSupplierName.value,
            taxId: newSupplierTaxId.value,
            contact: newSupplierContact.value || undefined,
        });
        supplierId.value = supplier.id;
        newSupplierName.value = "";
        newSupplierTaxId.value = "";
        newSupplierContact.value = ""; 
        message.success("Fornecedor cadastrado");
    } catch {
        message.error("Erro ao cadastrar fornecedor");
    }
}

function openNewProductModal(index: number) {
    activeItemIndex.value = index;
    productPicker.showModal = true;
}

async function handleCreateProduct() {
    try {
        const product = await productPicker.create({
            name: newProductName.value,
            category: newProductCategory.value,
            unit: newProductUnit.value,
            specification: newProductSpecification.value,
        });
        if (activeItemIndex.value !== null) {
            items.value[activeItemIndex.value].productId = product.id;  
        }
        newProductName.value = "";
        newProductCategory.value = "";
        newProductUnit.value = "";
        newProductSpecification.value = "";
        message.success("Produto cadastrado");
    } catch {
        message.error("Erro ao cadastrar produto");
    }
}

function validateForm(): string | null {
    if (!supplierId.value) return "Selecione um fornecedor";
    if (!invoiceNumber.value.trim()) return "Informe o número da nota";
    if (!issueDate.value) return "Informe a data da emissão";
    if (items.value.length === 0) return "Adicione pelo menos um item";

    for (const item of items.value) {
        if (!item.productId) return "Selecione o produto em todos os itens";
        if (!item.quantity || item.quantity <= 0) return "Quantidade deve ser maior que zero em todos os itens";
        if (!item.unitPrice || item.unitPrice <= 0) return "Valor unitário deve ser maior que zero em todos os itens";
    }

    return null;
}

async function handleSubmit() {
    const error = validateForm();
    if (error) {
        message.error(error);
        return;
    }

    submitting.value = true;
    try {
        await createPurchase({
            invoiceNumber: invoiceNumber.value,
            issueDate: new Date(issueDate.value!).toISOString(),
            entryMethod: entryMethod.value,
            supplierId: supplierId.value!,
            userId: authStore.user!.id,
            items: items.value.map((item) => ({
                productId: item.productId!,
                quantity: item.quantity!,
                unitPrice: item.unitPrice!,
            })),
        });
        message.success("Compra lançada com sucesso");
        supplierId.value = null;
        invoiceNumber.value = "";
        issueDate.value = null;
        entryMethod.value = "MANUAL";
        items.value = [];
    } catch {
        message.error("Erro ao lançar compra");
    } finally {
        submitting.value = false;
    }
}

</script>

<template>
    <n-card title="Nova compra">
        <n-form>
            <n-form-item label="Fornecedor">
                <n-select
                    v-model:value="supplierId"
                    :options="supplierPicker.options"
                    filterable
                    placeholder="Busque o fornecedor"
                />
                <n-button text style="margin-left: 8px" @click="supplierPicker.showModal = true">
                    + novo fornecedor
                </n-button>
            </n-form-item>

            <n-form-item label="Número da nota">
                <n-input v-model:value="invoiceNumber" placeholder="Ex: 000123" />
            </n-form-item>

            <n-form-item label="Data da emissão">
                <n-date-picker v-model:value="issueDate" type="date" />
            </n-form-item>

            <n-form-item label="Forma de lançamento">
                <n-select v-model:value="entryMethod" :options="entryMethodOptions" /> 
            </n-form-item>
        </n-form>
    </n-card>

    <n-card title="Itens da compra" style="margin-top: 16px">
        <div 
            v-for="(item, index) in items"
            :key="index"
            style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <n-select
                v-model:value="item.productId"
                :options="productPicker.options"
                filterable
                placeholder="Produto"
                style="flex: 2"
            />
            <n-button text @click="openNewProductModal(index)">+ novo</n-button>
            <n-input-number v-model:value="item.quantity" placeholder="Qtd" style="flex: 1" />
            <n-input-number v-model:value="item.unitPrice" placeholder="Valor unit." :precision="2" style="flex: 1" />
            <span style="flex: 1">{{ itemTotal(item).toFixed(2) }}</span>
            <n-button text type="error" @click="removeItem(index)">remover</n-button>
        </div>

        <n-button dashed block @click="addItem">+ adicionar item</n-button>
    
        <n-divider />
        <strong>Total da nota: {{ grandTotal.toFixed(2) }}</strong>
    </n-card>

    <n-button type="primary" :loading="submitting" @click="handleSubmit" style="margin-top: 16px">
        Lançar compra
    </n-button>


    <n-modal v-model:show="supplierPicker.showModal">
        <n-card title="Novo fornecedor" style="width: 400px;" closable @close="supplierPicker.showModal = false">
            <n-form>
                <n-form-item label="Nome">
                    <n-input v-model:value="newSupplierName" />
                </n-form-item>
                <n-form-item label="CNPJ">
                    <n-input v-model:value="newSupplierTaxId" placeholder="Só números, 14 dígitos" />
                </n-form-item>
                <n-form-item label="Contato">
                    <n-input v-model:value="newSupplierContact" />
                </n-form-item>
                <n-button type="primary" :loading="supplierPicker.creating" @click="handleCreateSupplier" block>
                    Salvar
                </n-button>
            </n-form>    
        </n-card>
    </n-modal>

    <n-modal v-model:show="productPicker.showModal">
        <n-card title="Novo produto" style="width: 400px;" closable @close="productPicker.showModal = false">
            <n-form>
                <n-form-item label="Nome">
                    <n-input v-model:value="newProductName" />
                </n-form-item>
                <n-form-item label="Categoria">
                    <n-input v-model:value="newProductCategory" />
                </n-form-item>
                <n-form-item label="Unidade">
                    <n-input v-model:value="newProductUnit" placeholder="Ex: un, kg, cx" />
                </n-form-item>
                <n-form-item label="Especificação">
                    <n-input v-model:value="newProductSpecification" />
                </n-form-item>
                <n-button type="primary" :loading="productPicker.creating" @click="handleCreateProduct" block>
                    Salvar
                </n-button>   
            </n-form>
        </n-card>
    </n-modal>
</template>