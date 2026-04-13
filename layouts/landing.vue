<template>
  <VApp>
    <VAppBar>
      <VAppBarTitle>My App</VAppBarTitle>
      <template #append>
        <div class="d-flex ga-2 mr-2">
          <VBtn variant="text" to="/login">Sign In</VBtn>
          <VBtn class="gradient primary" to="/signup">Sign Up</VBtn>
        </div>
      </template>
    </VAppBar>
    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>
