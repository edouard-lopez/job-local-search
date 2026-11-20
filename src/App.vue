<script setup>
import TopBar from "./components/organisms/TopBar.vue";
import AppFooter from "./components/organisms/AppFooter.vue";
</script>

<template>
  <div class="flex min-h-screen flex-col md:h-screen">
    <TopBar />
    <main class="min-h-0 flex-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
