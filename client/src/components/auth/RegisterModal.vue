<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Register</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            :rules="[val => !!val || 'Email is required']"
          />

          <q-input
            v-model="form.password"
            label="Password"
            type="password"
            :rules="[val => !!val || 'Password is required']"
          />

          <q-input
            v-model="form.confirmPassword"
            label="Confirm Password"
            type="password"
            :rules="[
              val => !!val || 'Please confirm your password',
              val => val === form.password || 'Passwords do not match'
            ]"
          />

          <div class="q-mt-md">
            <q-btn label="Register" type="submit" color="primary"/>
            <q-btn label="Cancel" color="primary" flat class="q-ml-sm" v-close-popup />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const show = ref(false);

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

const onSubmit = () => {
  // TODO: Implement registration logic
  console.log('Registration submitted:', form);
  // Here you would typically call a store action to handle registration
  // For now, we'll just log the form data and close the modal
  show.value = false;
};

defineExpose({ show });
</script>
