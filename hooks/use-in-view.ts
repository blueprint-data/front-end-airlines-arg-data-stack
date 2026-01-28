import { useEffect, useRef, useState } from "react"

type UseInViewOptions = IntersectionObserverInit & {
  once?: boolean
}

export function useInView<T extends Element>(options: UseInViewOptions = {}) {
  const {
    root = null,
    rootMargin = "240px 0px",
    threshold = 0.1,
    once = true,
  } = options

  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInView(true)
      return
    }

    const element = ref.current
    if (!element) return
    if (inView && once) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) {
              observer.disconnect()
            }
          } else if (!once) {
            setInView(false)
          }
        })
      },
      { root, rootMargin, threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [root, rootMargin, threshold, once, inView])

  return { ref, inView }
}
