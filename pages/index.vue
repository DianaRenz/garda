<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center" class="fill-height">
      <VCol cols="12" sm="8" md="6" class="text-center">
        <h1 class="text-h3 font-weight-bold mb-4">My App</h1>
        <p class="text-medium-emphasis text-body-1 mb-8">
          A short description of what your app does goes here.
        </p>
        <div class="d-flex ga-3 justify-center flex-wrap">
          <VBtn size="large" class="gradient primary" to="/signup">Get started</VBtn>
          <VBtn size="large" variant="outlined" to="/login">Sign in</VBtn>
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "landing" });
</script>
