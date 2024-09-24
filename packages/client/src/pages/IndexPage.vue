<template>
  <q-page class="column items-center justify-center">
    <h1 class="text-h2 q-mb-md">Welcome to Escape Relax and Be Jeweled</h1>
    <p class="text-subtitle1 q-mb-lg">Your one-stop shop for relaxation and jewelry</p>
    <q-btn color="primary" to="/test" label="Go to Test Page" />
    <!-- Removed the Increment Counter button and counter display -->
  </q-page>
</template>

<script setup lang="ts">
defineOptions({
  name: 'IndexPage'
});

// Removed counter logic as it's now handled in TestPage.vue
</script>
