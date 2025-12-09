'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Bắt đầu là true

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await authAPI.checkAuth();
            setUser(response.data.data.user);
            console.log('Auth check:', response.data.data.user);
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        } finally {
            console.log('Setting loading to false');
            setLoading(false); // ✅ Chỉ set false sau khi check xong
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { user } = response.data.data;

            setUser(user);
            return { success: true, id: user.id, role: user.role.roleName };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng nhập thất bại'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng ký thất bại'
            };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const updateUser = async (updatedData) => {
        setUser((prevUser) => ({
            ...prevUser,
            ...updatedData,
        }));
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        updateUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};