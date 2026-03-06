<template>
  <div class="antialiased">
    <div class="inset-x-0 top-0 fixed z-20">
      <div class="mx-auto px-4 max-w-3xl sm:px-6 xl:px-0 xl:max-w-5xl">
        <LmNav />
      </div>
    </div>

    <main class="mx-auto px-4 max-w-3xl sm:px-6 xl:px-0 xl:max-w-5xl">
      <slot />
    </main>

    <LmHelper />

    <LmFooter />
  </div>
</template>
