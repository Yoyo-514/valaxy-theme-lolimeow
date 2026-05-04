import type { Router } from 'vue-router'
import { onMounted } from 'vue'
import { isHomePaginationPath, lockNavbarScrollReaction } from '../utils'

export function useHomePaginationScrollBehavior(router: Router) {
  onMounted(() => {
    const previousScrollBehavior = router.options.scrollBehavior

    router.options.scrollBehavior = (to, from, savedPosition) => {
      if (savedPosition)
        return savedPosition

      if (isHomePaginationPath(to.path) && isHomePaginationPath(from.path)) {
        lockNavbarScrollReaction({ deferFrames: 2 })

        if (to.hash) {
          return {
            el: to.hash,
            top: 0,
          }
        }

        return { top: 0 }
      }

      if (previousScrollBehavior)
        return previousScrollBehavior(to, from, savedPosition)

      if (to.path !== from.path)
        return { top: 0 }
    }
  })
}
