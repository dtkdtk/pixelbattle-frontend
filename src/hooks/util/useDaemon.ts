import { useEffect, useRef, useState } from 'preact/hooks'
import { Daemon } from './types'

export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }

  return true
}

export function objectsEqual<T extends object>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) return false
  return keys1.every((k) => Object.is(obj1[k as keyof T], obj2[k as keyof T]))
}

export const useDaemon = <T extends object>(store: Daemon<T>): T => {
  const [, forceUpdate] = useState({})
  const stateRef = useRef(store.state)

  useEffect(() => {
    const sub = (newState: T) => {
      if (!objectsEqual(stateRef.current, newState)) {
        stateRef.current = newState
        forceUpdate({})
      }
    }
    store.on(sub)
    return () => store.off(sub)
  }, [store])

  return stateRef.current
}
