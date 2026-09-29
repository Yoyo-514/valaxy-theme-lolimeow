<template>
  <Layout>
    <div class="w-full">
      <LmArticle>
        <RouterView />
      </LmArticle>
    </div>
    <template #overlay>
      <LmTocMobile />
    </template>
  </Layout>
</template>
