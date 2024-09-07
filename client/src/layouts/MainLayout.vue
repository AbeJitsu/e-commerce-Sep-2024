<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Escape Relax and Be Jeweled
        </q-toolbar-title>

        <q-input v-model="searchQuery" dense standout placeholder="Search..." class="q-mr-sm">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn flat round dense icon="account_circle" />
        <q-btn flat round dense icon="shopping_cart" />
        <q-btn flat label="Register" @click="showRegisterModal" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <!-- Drawer content here -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <TheFooter />

    <RegisterModal ref="registerModal" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TheFooter from 'components/TheFooter.vue';
import RegisterModal from 'components/auth/RegisterModal.vue';

const leftDrawerOpen = ref(false);
const searchQuery = ref('');
const registerModal = ref(null);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function showRegisterModal() {
  registerModal.value.show = true;
}
</script>

<style lang="scss" scoped>
.q-toolbar {
  height: 64px;
}

.q-toolbar__title {
  font-size: 1.2rem;
  @media (max-width: 600px) {
    font-size: 1rem;
  }
}
</style>
