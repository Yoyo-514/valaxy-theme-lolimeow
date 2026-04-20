import type { Router } from 'vue-router'
import { isHomePaginationPath, lockNavbarScrollReaction } from '@theme/utils'
import { onMounted } from 'vue'

export function useHomePaginationScrollBehavior(router: Router) {
  onMounted(() => {
    const previousScrollBehavior = router.options.scrollBehavior

    router.options.scrollBehavior = (to, from, savedPosition) => {
      if (savedPosition)
        return savedPosition

      if (isHomePaginationPath(to.path) && isHomePaginationPath(from.path)) {
        lockNavbarScrollReaction({ deferFrames: 2 })
        return {
          el: '#lm-post-list-section',
          top: 0,
        }
      }

      if (previousScrollBehavior)
        return previousScrollBehavior(to, from, savedPosition)

      if (to.path !== from.path)
        return { top: 0 }
    }
  })
}
