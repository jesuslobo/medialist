import { useEffect, useRef, useState } from 'react'

export default function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  initial = false,
  ref,
}: {
  threshold?: number | number[],
  root?: Element | Document | null,
  rootMargin?: string,
  initial?: boolean,
  ref?: React.RefObject<any>,
}) {
  const refIfNotPassed = useRef(null)
  ref ||= refIfNotPassed
  // if browser doesn't support IntersectionObserver, return true
  initial ||= !('IntersectionObserver' in window)

  const [intersectionEntry, setIntersectionEntry] = useState<IntersectionObserverEntry | { isIntersecting: boolean }>({
    isIntersecting: initial,
  })

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        const thresholds = Array.isArray(observer.thresholds)
          ? observer.thresholds
          : [observer.thresholds]

        entries.forEach(entry => {
          const isIntersecting = entry.isIntersecting &&
            thresholds?.some(threshold => entry.intersectionRatio >= threshold)

          setIntersectionEntry({ ...entry, isIntersecting })
        })
      },
      { threshold, root, rootMargin },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, root, rootMargin, JSON.stringify(threshold)])

  return {
    ref,
    ...intersectionEntry
  }
}