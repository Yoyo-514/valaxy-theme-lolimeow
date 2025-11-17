<template>
  <Layout>
    <div class="divide-gray-200 divide-y dark:divide-gray-700">
      <StarterHeader />

      <slot>
        <RouterView />
      </slot>
    </div>
  </Layout>
</template>
