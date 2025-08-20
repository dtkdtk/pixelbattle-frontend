import { useState, useEffect } from 'preact/hooks'
import { Button } from 'src/components/General/Button'
import styles from './index.module.styl'

export const OverlaysPhoneHelper = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Проверяем, является ли устройство мобильным
    const checkIsMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera
      const isIOS =
        /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
      const isAndroid = /Android/i.test(userAgent)
      const isMobileDevice =
        /Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        )

      return isIOS || isAndroid || isMobileDevice || window.innerWidth <= 767
    }

    setIsMobile(checkIsMobile())

    // Добавляем слушатель для изменения размера окна
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Если не мобильное устройство, возвращаем null
  if (!isMobile) {
    return null
  }

  return (
    <div style={styles.list}>
      <Button type={'primary'} onClick={() => {}}>
        Вверх
      </Button>
      <Button type={'primary'} onClick={() => {}}>
        Вниз
      </Button>
      <Button type={'primary'} onClick={() => {}}>
        Влево
      </Button>
      <Button type={'primary'} onClick={() => {}}>
        Вправо
      </Button>
      <Button type={'primary'} onClick={() => {}}>
        Отменить
      </Button>
      <Button type={'primary'} onClick={() => {}}>
        Применить
      </Button>
    </div>
  )
}
