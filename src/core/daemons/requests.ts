import { config } from 'src/config'
import {
  ApiInfo,
  ProfileInfo,
  PixelInfo,
  ApiPixel,
  ApiTags,
  ApiResponse,
  ApiErrorResponse
} from './types'
import { ServerNotificationMap } from '../constants/notifications'
import { NotificationDaemon } from './notifications'
import { ProfileDaemon } from './profile'
import { Cookie } from '../storage/cookie'
import empty from '../../../public/images/textures/empty.png'

export default class RequestsDaemon {
  public static async pixels() {
    if (config.withoutServerMode.enable) return (await fetch(empty)).blob()
    return (await fetch(config.url.api + '/pixels.png')).blob()
  }

  public static info(): Promise<ApiInfo> {
    if (config.withoutServerMode.enable)
      return RequestsDaemon.fake(config.withoutServerMode.responds.info)
    return RequestsDaemon.get('/game')
  }

  public static profile(): Promise<ProfileInfo> {
    if (config.withoutServerMode.enable)
      return RequestsDaemon.fake(config.withoutServerMode.responds.profile)
    return RequestsDaemon.get<ProfileInfo>(`/users/${Cookie.get('userid')}`)
  }

  public static getPixel(x: number, y: number): Promise<PixelInfo> {
    if (config.withoutServerMode.enable)
      return RequestsDaemon.fake(config.withoutServerMode.responds.getPixel)
    return RequestsDaemon.get<PixelInfo>(`/pixels?x=${x}&y=${y}`)
  }

  public static putPixel(pixel: ApiPixel) {
    if (config.withoutServerMode.enable) return RequestsDaemon.fake({})
    return RequestsDaemon.put(`/pixels`, pixel, true)
  }

  public static tags(): Promise<ApiTags> {
    if (config.withoutServerMode.enable)
      return RequestsDaemon.fake(config.withoutServerMode.responds.tags)
    return RequestsDaemon.get(`/pixels/tag`)
  }

  public static changeTag(tag: string): Promise<ApiResponse> {
    if (config.withoutServerMode.enable)
      return RequestsDaemon.fake({ error: false, reason: '' })
    return RequestsDaemon.post(
      `/users/${ProfileDaemon.state.profile!.id}/tag`,
      { tag },
      true
    )
  }

  private static fake<T extends object>(data: T | ApiErrorResponse) {
    return Promise.resolve(data).then(RequestsDaemon.checkForErrors<T>)
  }

  private static post = <T extends object>(
    url: string,
    body: unknown,
    withCredentials: boolean = false
  ) => RequestsDaemon.fetch<T>({ url, method: 'POST', withCredentials, body })

  private static put = <T extends object>(
    url: string,
    body: unknown,
    withCredentials: boolean = false
  ) => RequestsDaemon.fetch<T>({ url, method: 'PUT', withCredentials, body })

  private static get = <T extends object>(
    url: string,
    withCredentials: boolean = false
  ) => RequestsDaemon.fetch<T>({ url, method: 'GET', withCredentials })

  private static fetch<T extends object>(options: {
    url: string
    method: 'POST' | 'PUT' | 'GET'
    withCredentials: boolean
    body?: unknown
  }) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (options.withCredentials) {
      if (ProfileDaemon.state.profile!)
        headers['Authorization'] =
          `Bearer ${ProfileDaemon.state.profile!.token}`
    }

    return fetch(config.url.api + options.url, {
      method: options.method,
      headers: options.method === 'GET' ? undefined : headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    })
      .then((res) => res.json() as Promise<T | ApiErrorResponse>)
      .then(RequestsDaemon.checkForErrors<T>)
  }

  private static checkForErrors<T extends object | ApiErrorResponse>(
    res: T | ApiErrorResponse
  ) {
    if ('error' in res && res.error) {
      RequestsDaemon.processError(res)

      return Promise.reject(res)
    }

    return res as T
  }

  private static processError(error: ApiErrorResponse) {
    const notification = ServerNotificationMap[error.reason] ?? {
      title: 'Неизвестная ошибка (С)',
      message: error.reason
    }
    NotificationDaemon.addNotification({
      ...notification,
      type: 'error'
    })
  }
}
