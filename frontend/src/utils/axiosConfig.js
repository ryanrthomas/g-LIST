// axiosConfig.js
import axios from "axios";
import { refreshAccessToken } from "./auth";

// Queue to hold failed requests while refreshing
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    
    failedQueue = [];
};

// Create an interceptor for handling 401 responses
axios.interceptors.response.use(
    (response) => response, // Return successful responses as-is
    async (error) => {
        const originalRequest = error.config;
        
        // Skip refresh logic for refresh requests themselves
        if (originalRequest.skipAuthRefresh) {
            return Promise.reject(error);
        }
        
        // If we get a 401 and haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // If we're already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axios(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            try {
                const newAccessToken = await refreshAccessToken();
                
                // Process any queued requests
                processQueue(null, newAccessToken);
                
                // Update the original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                
                // Retry the original request
                return axios(originalRequest);
            } catch (refreshError) {
                // Process queue with error
                processQueue(refreshError, null);
                
                // Refresh failed, redirect to login
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);