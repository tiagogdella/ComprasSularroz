import { computed, reactive, ref } from "vue";

export function useEntityPicker<T extends { id: number; name: string }, C>(
    listFn: () => Promise<T[]>,
    createFn: (input: C) => Promise<T>,
) {
    const list = ref<T[]>([]);
    const showModal = ref(false);
    const creating = ref(false);

    async function load() {
        list.value = await listFn();
    }

    const options = computed(() => 
        list.value.map((item) => ({ label: item.name, value: item.id }))
    );

    async function create(input: C): Promise<T> {
        creating.value = true;
        try {
            const created = await createFn(input);
            await load();
            showModal.value = false;
            return created;
        } finally {
            creating.value = false;
        }
    }

    return reactive({ list, options, load, showModal, creating, create });
}