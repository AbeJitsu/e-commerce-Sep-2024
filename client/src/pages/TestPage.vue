<template>
  <q-page class="flex flex-center">
    <div>
      <q-btn @click="fetchCount" color="primary" label="Increment Count" />
      <p>Count: {{ count }}</p>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'TestPage',
  setup () {
    const count = ref(0)

    const fetchCount = async () => {
      try {
        const response = await api.get('/count')
        count.value = response.data.count
      } catch (error) {
        console.error('Error fetching count:', error)
      }
    }

    return { count, fetchCount }
  }
})
</script>
