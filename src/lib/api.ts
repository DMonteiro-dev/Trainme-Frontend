import axios from 'axios';

type InterceptorOptions = {
    getAccessToken: () => string | null;
    refreshToken: () => Promise<string | null>;
    onLogout: () => void;
};

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {},
    withCredentials: true,
});

export const unwrapResponse = <T>(payload: unknown): T => {
    if (payload && typeof payload === 'object' && payload !== null && 'data' in (payload as Record<string, unknown>)) {
        const inner = (payload as { data?: unknown }).data;
        if (inner !== undefined) {
            return inner as T;
        }
    }

    return payload as T;
};

export const setupInterceptors = ({ getAccessToken, refreshToken, onLogout }: InterceptorOptions) => {
    let refreshPromise: Promise<string | null> | null = null;

    const requestInterceptor = apiClient.interceptors.request.use((config) => {
        const token = getAccessToken();

        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }

        return config;
    });

    const responseInterceptor = apiClient.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (
                error.response?.status === 401 &&
                originalRequest &&
                !originalRequest._retry &&
                !originalRequest.skipAuthRefresh
            ) {
                originalRequest._retry = true;

                try {
                    refreshPromise = refreshPromise ?? refreshToken();
                    const newAccessToken = await refreshPromise;
                    refreshPromise = null;

                    if (newAccessToken) {
                        originalRequest.headers = originalRequest.headers ?? {};
                        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;

                        return apiClient(originalRequest);
                    }

                    onLogout();
                } catch (refreshError) {
                    refreshPromise = null;
                    onLogout();
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        },
    );

    return () => {
        apiClient.interceptors.request.eject(requestInterceptor);
        apiClient.interceptors.response.eject(responseInterceptor);
    };
};

export default apiClient;
