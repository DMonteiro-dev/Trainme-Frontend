import 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
  }

  interface AxiosRequestConfig<D = any> {
    skipAuthRefresh?: boolean;
  }
}
