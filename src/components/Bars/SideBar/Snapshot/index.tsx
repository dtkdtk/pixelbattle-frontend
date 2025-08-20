import { Button } from 'src/components/General/Button'
import { TextField } from 'src/components/General/TextFIeld'
import { WindowBox } from 'src/components/General/WindowBox'
import { SnapshotDaemon } from 'src/core/daemons/snapshot'
import styles from './index.module.styl'

export const Snapshot = () => {
  return (
    <WindowBox title='Снимок холста'>
      <div className={styles.wrapper}>
        <Button onClick={() => void SnapshotDaemon.toggle()}>
          {SnapshotDaemon.state.enable ? 'Остановить' : 'Область'}
        </Button>
        <p class={styles.or}>или</p>
        <Button onClick={() => void SnapshotDaemon.fullScreenshot()}>
          Всего холста
        </Button>

        {SnapshotDaemon.state.empty ? (
          <></>
        ) : (
          <>
            <p class={styles.groupTitle + styles.label}>Действия</p>
            <Button onClick={() => void SnapshotDaemon.toFile()}>
              Сохранить
            </Button>
          </>
        )}

        <p class={styles.label}>Множитель масштаба </p>
        <TextField
          placeholder='Множитель масштаба'
          onInput={(v: string) => {
            !isNaN(v as any) ? (SnapshotDaemon.state.scale = Number(v)) : ''
          }}
          type='number'
          min={1}
          max={100}
          value={SnapshotDaemon.state.scale + ''}
        ></TextField>
      </div>
    </WindowBox>
  )
}
