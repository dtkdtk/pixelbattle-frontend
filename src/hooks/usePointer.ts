import { useDaemon } from './util/useDaemon'
import { PointerDaemon } from 'src/core/daemons/pointer'
import { PointerState } from 'src/core/daemons/types'

export const usePointer = (): PointerState => {
  const state = useDaemon<PointerState>(PointerDaemon)

  return state
}
