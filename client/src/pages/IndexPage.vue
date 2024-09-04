<template>
  <q-page class="column items-center justify-center">
    <h1 class="text-h2 q-mb-md">Welcome to Escape Relax and Be Jeweled</h1>
    <p class="text-subtitle1 q-mb-lg">Your one-stop shop for relaxation and jewelry</p>
    <q-btn color="primary" to="/test" label="Go to Test Page" />
    <q-btn color="secondary" @click="incrementCounter" class="q-mt-md" label="Increment Counter" />
    <p class="q-mt-md">Counter: {{ counter }}</p>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';

defineOptions({
  name: 'IndexPage'
});

const counter = ref(0);

async function incrementCounter() {
  try {
    const response = await api.get('/count');
    counter.value = response.data.count;
  } catch (error) {
    console.error('Error incrementing counter:', error);
  }
}
</script>
