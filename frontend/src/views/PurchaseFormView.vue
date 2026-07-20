<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMessage } from "naive-ui";
import { createSupplier, listSuppliers, type Supplier } from "../services/api/supplier.service";

const message = useMessage();

const suppliers = ref<Supplier[]>([]);
const supplierId = ref<number | null>(null);
const invoiceNumber = ref("");
const issueDate = ref<number | null>(null);
const entryMethod = ref<"MANUAL" | "SCANNED">("MANUAL");

const entryMethodOptions = [
    { label: "Manual", value: "MANUAL" },
    { label: "Escameada", value: "SCANNED" },
];

const showNewSupplierModal = ref(false);
const newSupplierName = ref("");
const newSupplierTaxId = ref("");
const newSupplierContact = ref("");
const creatingSupplier = ref(false);

async function loadSuppliers() {
    suppliers.value = await listSuppliers();
}

onMounted(loadSuppliers);

const suppliersOptions = computed(() => 
    suppliers.value.map((s) => ({ label: s.name, value: s.id }))
);

async function handleCreateSupplier(){
    creatingSupplier.value = true;
    try {
        const supplier = await createSupplier({
            name: newSupplierName.value,
            taxId: newSupplierTaxId.value,
            contact: newSupplierContact.value || undefined,
        });
        await loadSuppliers();
        supplierId.value = supplier.id;
        showNewSupplierModal.value = false;
        newSupplierName.value = "";
        newSupplierTaxId.value = "";
        newSupplierContact.value = "";
        message.success("Fornecedor cadastrado");
    } catch {
        message.error("Erro ao cadastrar fornecedor");
    } finally {
        creatingSupplier.value = false;
    }
}
</script>

<template>
    <n-card title="Nova compra">
        <n-form>
            <n-form-item label="Fornecedor">
                <n-select
                    v-model:value="supplierId"
                    :options="suppliersOptions"
                    filterable
                    placeholder="Busque o fornecedor"
                />
                <n-button text style="margin-left: 8px" @click="showNewSupplierModal = true">
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

    <n-modal v-model:show="showNewSupplierModal">
        <n-card title="Novo fornecedor" style="width: 400px;" closable @close="showNewSupplierModal = false">
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
                <n-button type="primary" :loading="creatingSupplier" @click="handleCreateSupplier" block>
                    Salvar
                </n-button>
            </n-form>    
        </n-card>
    </n-modal>
</template>