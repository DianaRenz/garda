<template>
  <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 60vh">
    <VProgressCircular indeterminate color="primary" />
  </div>
</template>

<script setup lang="ts">
import { onAuthStateChanged } from 'firebase/auth';

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const loading = ref(true);

onMounted(async () => {
  if (import.meta.server) return;

  const user = await new Promise<any>((resolve) => {
    const unsub = onAuthStateChanged($auth, (u) => { unsub(); resolve(u); });
  });

  if (!user) {
    await navigateTo('/apartment', { replace: true });
    return;
  }

  // Check role
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc($db, 'users', user.uid));
  const role = snap.exists() ? snap.data()?.role : null;

  await navigateTo(role === 'admin' ? '/admin' : '/apartment', { replace: true });
});
</script>
