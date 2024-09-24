<template>
  <q-footer class="bg-primary text-white">
    <q-toolbar>
      <q-toolbar-title>
        <div>Escape Relax and Be Jeweled © {{ currentYear }}</div>
      </q-toolbar-title>
      <q-space />
      <q-btn flat label="About" to="/about" />
      <q-btn flat label="Contact" to="/contact" />
      <q-btn flat label="Terms" to="/terms" />
      <q-btn flat label="Privacy" to="/privacy" />
    </q-toolbar>
  </q-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>
