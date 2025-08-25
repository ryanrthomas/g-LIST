// auth.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_DEV;

// Global state to manage refresh process
let isRefreshing = false;
let refreshPromise = null;

export const refreshAccessToken = async () => {
    // If already refreshing, return the existing promise
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    // Set refreshing state and create new promise
    isRefreshing = true;
    refreshPromise = performRefresh();

    try {
        const result = await refreshPromise;
        return result;
    } finally {
        // Reset state after completion (success or failure)
        isRefreshing = false;
        refreshPromise = null;
    }
};

const performRefresh = async () => {
    try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        // Make refresh request WITHOUT going through the interceptor
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
        }, {
            // This prevents the interceptor from processing this request
            skipAuthRefresh: true
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        
        // Update stored tokens
        localStorage.setItem("access_token", access_token);
        if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken);
        }
        
        return access_token;
    } catch (error) {
        // Refresh failed, user needs to login again
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_code");
        window.location.href = "/";
        throw error;
    }
};