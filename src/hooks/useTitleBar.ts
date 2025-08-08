import { InfoState } from 'src/core/daemons/types'
import { ComputedActions, useDaemonComputed } from './util/useDaemonComputed'
import { useState } from 'preact/hooks'
import { InfoDaemon } from 'src/core/daemons/info'

interface ComputedValues<T> extends ComputedActions<T> {
  name: (value: T) => string
  icon: (value: T) => string
  show: (value: T) => boolean
}

export const useTitleBar = () => {
  const [info, { name, icon, show }] = useDaemonComputed<
    InfoState,
    ComputedValues<NonNullable<InfoState>>
  >(InfoDaemon, {
    name: ({ name }) => (name === 'season:blank' ? 'Без названия' : name),
    icon: ({ ended }) => (ended ? '🏁' : '⚔️'),
    show: (s) => s.canvas !== undefined
  })

  const [opened, setOpened] = useState<boolean>(false)

  const click = () => {
    setOpened(!opened)
  }

  return { click, opened, info, name, icon, show }
}
