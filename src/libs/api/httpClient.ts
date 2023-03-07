import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface Response<T> {
  code: number
  message: string
  status: boolean
  data: T
  id?: number
}

class AxiosClient {
  private readonly axiosInstance: AxiosInstance
  static instance: AxiosClient

  static getInstance() {
    if (!AxiosClient.instance) {
      AxiosClient.instance = new AxiosClient()
    }
    return AxiosClient.instance
  }

  // setAccessToken = (accessToken: string) => {
  //   window.localStorage.setItem(APP_TOKEN_LOCALKEY, accessToken)
  // }

  public constructor() {
    this.axiosInstance = axios.create({
      headers: {
        'content-type': 'application/json',
      },
    })

    this._initializeInterceptor()
  }

  private _initializeInterceptor = () => {
    // this.axiosInstance.interceptors.request.use(this._handleRequest)
    this.axiosInstance.interceptors.response.use(this._handleResponse, this._handleError)
  }

  private _handleRequest = async (config: AxiosRequestConfig) => {
    //to do

    return config
  }

  private _handleResponse = (response: AxiosResponse) => {
    if (['image/png'].includes(response.headers['content-type'])) return response
    if (response.data) return response.data
    return response
  }

  private _handleError = (error: AxiosError<any>) => {
    if (error.response && error.config && !error.config.url?.includes('/login')) {
      if (error.response.status === 400 && error.response.data?.message) {
        console.log('api error: ', error.response.data?.message)
      } else if (error.response.status === 401) {
        // handle error 401
      } else {
        // store.dispatch(notify({ message: `${error.config.url} is fail` }))
      }
    }

    return Promise.reject(error)
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post(url, data, config)
  }

  get<T>(url: string, config?: AxiosRequestConfig, isMock?: boolean): Promise<T> {
    const cf: AxiosRequestConfig = config ?? { headers: {} }
    if (!cf.headers) {
      cf.headers = { ENABLE_MOCK: isMock || false }
    }
    return this.axiosInstance.get(url, { ...cf })
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put(url, data, config)
  }

  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.patch(url, data, config)
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete(url, config)
  }
}

export default AxiosClient.getInstance()
