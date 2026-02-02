import { useEffect, useState } from 'react'

export function useCounter(
  end: number,
  duration: number = 2000,
  start: number = 0
) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    if (end === 0) {
      setCount(0)
      return
    }

    let startTime: number | null = null
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setCount(Math.floor(start + (end - start) * easeOutQuart))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration, start])

  return count
}
