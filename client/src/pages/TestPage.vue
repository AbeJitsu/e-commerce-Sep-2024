<template>
  <q-page class="flex flex-center">
    <div>
      <q-btn @click="fetchCount" color="primary" label="Increment Count" />
      <p>Count: {{ count }}</p>
      <p v-if="confirmationMessage" class="text-positive">{{ confirmationMessage }}</p>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { fetchCounter } from '../api/counter';

export default defineComponent({
  name: 'TestPage',
  setup () {
    const count = ref(0)
    const confirmationMessage = ref('')

    const fetchCount = async () => {
  try {
    const { count: newCount, message } = await fetchCounter();
    console.log('Fetched count:', newCount);
    console.log('Confirmation message:', message);
    count.value = newCount;
    confirmationMessage.value = message;
  } catch (error) {
    console.error('Error fetching count:', error);
  }
}

    return { count, fetchCount, confirmationMessage }
  }
})
</script>
