import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Response interceptor để xử lý lỗi
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Generic API helper
export const api = {
    get: async (endpoint) => {
        try {
            return await apiClient.get(endpoint);
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    },
    post: async (endpoint, data) => {
        try {
            return await apiClient.post(endpoint, data);
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    },
    put: async (endpoint, data) => {
        try {
            return await apiClient.put(endpoint, data);
        } catch (error) {
            console.error(`PUT ${endpoint} failed:`, error);
            throw error;
        }
    },
    patch: async (endpoint, data) => {
        try {
            return await apiClient.patch(endpoint, data);
        } catch (error) {
            console.error(`PATCH ${endpoint} failed:`, error);
            throw error;
        }
    },
    del: async (endpoint) => {
        try {
            return await apiClient.delete(endpoint);
        } catch (error) {
            console.error(`DELETE ${endpoint} failed:`, error);
            throw error;
        }
    },
};

// Auth endpoints
export const authAPI = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    checkAuth: () => apiClient.get('/auth/check'),
};

// User endpoints
export const userAPI = {
    getAll: () => apiClient.get('/users'),
    getActive: () => apiClient.get('/users/active'),
    getInactive: () => apiClient.get('/users/inactive'),
    getStats: () => apiClient.get('/users/stats'),
    getByRole: (roleId) => apiClient.get(`/users/role/${roleId}`),
    getById: (id) => apiClient.get(`/users/${id}`),
    create: (user) => apiClient.post('/users', user),
    update: (id, user) => apiClient.put(`/users/${id}`, user),
    delete: (id) => apiClient.delete(`/users/${id}`),
    activate: (id) => apiClient.patch(`/users/${id}/activate`),
    deactivate: (id) => apiClient.patch(`/users/${id}/deactivate`),
};

// Role endpoints
export const roleAPI = {
    getAll: () => apiClient.get('/roles'),
    create: (role) => apiClient.post('/roles', role),
};

// Category endpoints
export const categoryAPI = {
    getAll: () => apiClient.get('/categories'),
    getActive: () => apiClient.get('/categories/active'),
    getById: (id) => apiClient.get(`/categories/${id}`),
    create: (category) => apiClient.post('/categories', category),
    update: (id, category) => apiClient.put(`/categories/${id}`, category),
    delete: (id) => apiClient.delete(`/categories/${id}`),
};

// Item endpoints (Menu items)
export const itemAPI = {
    getAll: () => apiClient.get('/items'),
    search: (query) => apiClient.get(`/items/search?q=${query}`),
    getByCategory: (categoryId) => apiClient.get(`/items/category/${categoryId}`),
    getById: (id) => apiClient.get(`/items/${id}`),
    create: (item) => apiClient.post('/items', item, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, item) => apiClient.put(`/items/${id}`, item),
    delete: (id) => apiClient.delete(`/items/${id}`),
};

// Combo endpoints
export const comboAPI = {
    getAll: () => apiClient.get('/combos'),
    getActive: () => apiClient.get('/combos/active'),
    getById: (id) => apiClient.get(`/combos/${id}`),
    getItems: (id) => apiClient.get(`/combos/${id}/items`),
    create: (combo) => apiClient.post('/combos', combo),
    update: (id, combo) => apiClient.put(`/combos/${id}`, combo),
    delete: (id) => apiClient.delete(`/combos/${id}`),
};

// Order endpoints
export const orderAPI = {
    getAll: () => apiClient.get('/orders'),
    getToday: () => apiClient.get('/orders/today'),
    getByStatus: (status) => apiClient.get(`/orders/status/${status}`),
    getByCustomer: (customerId) => apiClient.get(`/orders/customer/${customerId}`),
    getById: (id) => apiClient.get(`/orders/${id}`),
    getActiveUnpaid: (customerId, tableId) => apiClient.get('/orders/active-unpaid', { params: { customerId, tableId } }),
    create: (order) => apiClient.post('/orders', order),
    addItems: (orderId, items) => apiClient.post(`/orders/${orderId}/items`, { items }),
    update: (id, order) => apiClient.put(`/orders/${id}`, order),
    updateStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),
    delete: (id) => apiClient.delete(`/orders/${id}`),
};

// Order Detail endpoints
export const orderDetailAPI = {
    getAll: () => apiClient.get('/order-details'),
    getByOrder: (orderId) => apiClient.get(`/order-details/order/${orderId}`),
    getById: (id) => apiClient.get(`/order-details/${id}`),
    create: (orderDetail) => apiClient.post('/order-details', orderDetail),
    update: (id, orderDetail) => apiClient.put(`/order-details/${id}`, orderDetail),
    delete: (id) => apiClient.delete(`/order-details/${id}`),
};

// Table endpoints
export const tableAPI = {
    getAll: () => apiClient.get('/tables'),
    getById: (id) => apiClient.get(`/tables/${id}`),
    create: (table) => apiClient.post('/tables', table),
    update: (id, table) => apiClient.put(`/tables/${id}`, table),
    delete: (id) => apiClient.delete(`/tables/${id}`),
};

// Promotion endpoints
export const promotionAPI = {
    // Basic CRUD
    getAll: (params = {}) =>
        apiClient.get('/promotions', { params }),

    getById: (id) =>
        apiClient.get(`/promotions/${id}`),

    create: (data) =>
        apiClient.post('/promotions', data),

    update: (id, data) =>
        apiClient.put(`/promotions/${id}`, data),

    delete: (id) =>
        apiClient.delete(`/promotions/${id}`),

    // Query methods
    getActive: () =>
        apiClient.get('/promotions/active'),

    getStats: (id) =>
        apiClient.get(`/promotions/${id}/stats`),

    validate: (id, orderAmount = 0) =>
        apiClient.get(`/promotions/${id}/validate`, {
            params: { orderAmount }
        }),

    clone: (id, data = {}) =>
        apiClient.post(`/promotions/${id}/clone`, data),
};

export const comboItemAPI = {
    delete: (id) => apiClient.delete(`/combo-items/${id}`),
    create: (comboItem) => apiClient.post('/combo-items', comboItem)
}

export const customerPromotionAPI = {
    // ===== Assignment Management =====

    /**
     * Gán promotion cho tất cả hoặc một nhóm customers
     * @param {number} promotionId 
     * @param {object} options - { onlyRegistered: boolean, customerType: string }
     */
    assignToCustomers: (promotionId, options = {}) =>
        apiClient.post(`/customer-promotions/promotions/${promotionId}/assign`, options),

    /**
     * Gán promotion cho 1 customer cụ thể
     */
    assignToCustomer: (promotionId, customerId) =>
        apiClient.post(`/customer-promotions/promotions/${promotionId}/customers/${customerId}`),

    /**
     * Bỏ gán promotion từ customer
     */
    unassignFromCustomer: (promotionId, customerId) =>
        apiClient.delete(`/customer-promotions/promotions/${promotionId}/customers/${customerId}`),

    // ===== Usage Management =====

    /**
     * Kiểm tra customer có thể dùng promotion không
     * @param {number} customerId 
     * @param {number} promotionId 
     * @param {number} orderAmount 
     * @returns {Promise} { eligible: boolean, reason: string, discount: object }
     */
    checkEligibility: (customerId, promotionId, orderAmount = 0) =>
        apiClient.get(`/customer-promotions/customers/${customerId}/promotions/${promotionId}/check`, {
            params: { orderAmount }
        }),

    /**
     * Apply promotion vào order (đánh dấu đã sử dụng)
     * @param {number} customerId 
     * @param {number} promotionId 
     * @param {object} data - { orderId: number, orderAmount: number }
     */
    applyPromotion: (customerId, promotionId, data) =>
        apiClient.post(`/customer-promotions/customers/${customerId}/promotions/${promotionId}/apply`, data),

    /**
     * Hủy việc sử dụng promotion (admin)
     * @param {number} assignmentId - ID của CustomerPromotion record
     */
    cancelUsage: (assignmentId) =>
        apiClient.post(`/customer-promotions/assignments/${assignmentId}/cancel`),

    // ===== Query Endpoints =====

    /**
     * Lấy tất cả promotions của customer
     * @param {number} customerId 
     * @param {object} options - { status: string, includeExpired: boolean }
     */
    getCustomerPromotions: (customerId, options = {}) =>
        apiClient.get(`/customer-promotions/customers/${customerId}/promotions`, {
            params: options
        }),

    /**
     * Lấy danh sách customers được gán promotion
     * @param {number} promotionId 
     * @param {object} options - { status: string, limit: number }
     */
    getPromotionCustomers: (promotionId, options = {}) =>
        apiClient.get(`/customer-promotions/promotions/${promotionId}/customers`, {
            params: options
        }),

    /**
     * Lấy lịch sử sử dụng promotion
     * @param {object} filters - { customerId, promotionId, status, startDate, endDate, limit }
     */
    getUsageHistory: (filters = {}) =>
        apiClient.get('/customer-promotions/usage-history', {
            params: filters
        }),
};

export const customerAPI = {
    // Basic CRUD
    getAll: (params = {}) =>
        apiClient.get('/customers', { params }),

    getById: (id) =>
        apiClient.get(`/customers/${id}`),

    create: (data) =>
        apiClient.post('/customers', data),

    update: (id, data) =>
        apiClient.put(`/customers/${id}`, data),

    delete: (id) =>
        apiClient.delete(`/customers/${id}`),

    getByUser: (userId) =>
        apiClient.get(`/customers/user/${userId}`),
};

export const staffAPI = {
    // ===== ORDER TRACKING APIs =====

    // Lấy tất cả orders
    getAllOrders: async () => {
        try {
            const response = await apiClient.get('/orders');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    // Lấy orders hôm nay
    getTodayOrders: async () => {
        try {
            const response = await apiClient.get('/orders/today');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching today orders:', error);
            throw error;
        }
    },

    // Lấy orders theo status
    getOrdersByStatus: async (status) => {
        try {
            const response = await apiClient.get(`/orders/status/${status}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching orders by status:', error);
            throw error;
        }
    },

    // Lấy chi tiết order
    getOrderById: async (orderId) => {
        try {
            const response = await apiClient.get(`/orders/${orderId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },

    // Lấy active order cho một table
    getActiveOrderByTable: async (tableId) => {
        try {
            const response = await apiClient.get(`/orders/table/${tableId}/active`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching active order for table:', error);
            throw error;
        }
    },

    // Lấy order details (items) theo orderId
    getOrderItems: async (orderId) => {
        try {
            const response = await apiClient.get(`/order-details/order/${orderId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching order items:', error);
            throw error;
        }
    },

    // Cập nhật status của order
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
            return response.data.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    // Cập nhật status của order item (order detail) - for items
    updateOrderItemStatus: async (orderDetailId, status) => {
        try {
            const response = await apiClient.put(`/order-details/${orderDetailId}/item`, { status });
            return response.data.data;
        } catch (error) {
            console.error('Error updating order item status:', error);
            throw error;
        }
    },

    // Cập nhật status của order combo (order detail) - for combos
    updateOrderComboStatus: async (orderDetailId, status) => {
        try {
            const response = await apiClient.put(`/order-details/${orderDetailId}/combo`, { status });
            return response.data.data;
        } catch (error) {
            console.error('Error updating order combo status:', error);
            throw error;
        }
    },

    // ===== TABLE MANAGEMENT APIs =====

    // Lấy tất cả tables
    getAllTables: async () => {
        try {
            const response = await apiClient.get('/tables');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching tables:', error);
            throw error;
        }
    },

    // Lấy chi tiết table
    getTableById: async (tableId) => {
        try {
            const response = await apiClient.get(`/tables/${tableId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching table details:', error);
            throw error;
        }
    },

    // Cập nhật status của table
    updateTableStatus: async (tableId, status) => {
        try {
            const response = await apiClient.put(`/tables/${tableId}`, { status });
            return response.data.data;
        } catch (error) {
            console.error('Error updating table status:', error);
            throw error;
        }
    },

    // Tạo table mới
    createTable: async (tableData) => {
        try {
            const response = await apiClient.post('/tables', tableData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    },

    // ===== MENU/ITEM APIs =====

    // Lấy tất cả items
    getAllItems: async () => {
        try {
            const response = await apiClient.get('/items');
            return response.data;
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    },

    // Tìm kiếm items
    searchItems: async (query) => {
        try {
            const response = await apiClient.get(`/items/search?q=${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching items:', error);
            throw error;
        }
    },

    // Lấy items theo category
    getItemsByCategory: async (categoryId) => {
        try {
            const response = await apiClient.get(`/items/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching items by category:', error);
            throw error;
        }
    },

    // ===== COMBO APIs =====

    // Lấy tất cả combos
    getAllCombos: async () => {
        try {
            const response = await apiClient.get('/combos');
            return response.data;
        } catch (error) {
            console.error('Error fetching combos:', error);
            throw error;
        }
    },

    // Lấy active combos
    getActiveCombos: async () => {
        try {
            const response = await apiClient.get('/combos/active');
            return response.data;
        } catch (error) {
            console.error('Error fetching active combos:', error);
            throw error;
        }
    },

    // Lấy items trong combo
    getComboItems: async (comboId) => {
        try {
            const response = await apiClient.get(`/combos/${comboId}/items`);
            return response.data;
        } catch (error) {
            console.error('Error fetching combo items:', error);
            throw error;
        }
    },

    // ===== CATEGORY APIs =====

    // Lấy tất cả categories
    getAllCategories: async () => {
        try {
            const response = await apiClient.get('/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // Lấy active categories
    getActiveCategories: async () => {
        try {
            const response = await apiClient.get('/categories/active');
            return response.data;
        } catch (error) {
            console.error('Error fetching active categories:', error);
            throw error;
        }
    },

    // ===== INVOICE APIs =====

    // Tạo invoice cho order
    createInvoice: async (orderId) => {
        try {
            const response = await apiClient.post('/invoices', { orderId });
            return response.data;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    },

    // Lấy invoice theo orderId
    getInvoiceByOrderId: async (orderId) => {
        try {
            const response = await apiClient.get(`/invoices/order/${orderId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching invoice by order ID:', error);
            throw error;
        }
    },

    // ===== PAYMENT APIs =====

    // Tạo payment
    createPayment: async (paymentData) => {
        try {
            const response = await apiClient.post('/payments', paymentData);
            return response.data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    // Lấy payments theo status
    getPaymentsByStatus: async (status) => {
        try {
            const response = await apiClient.get(`/payments/status/${status}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching payments by status:', error);
            throw error;
        }
    },

    // Lấy payments theo orderId
    getPaymentsByOrder: async (orderId) => {
        try {
            const response = await apiClient.get(`/payments/order/${orderId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching payments by order:', error);
            throw error;
        }
    },

    // Xác nhận payment
    confirmPayment: async (paymentId, paymentData) => {
        try {
            const response = await apiClient.post(`/payments/${paymentId}/confirm`, paymentData);
            return response.data.data;
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    }
};

// Analytics endpoints
export const analyticsAPI = {
    getRevenueByMonth: (months = 6) => apiClient.get(`/analytics/revenue-by-month?months=${months}`),
    getBestSellingItems: (limit = 10) => apiClient.get(`/analytics/best-selling-items?limit=${limit}`),
    getComboShare: () => apiClient.get('/analytics/combo-share'),
    getKPIs: () => apiClient.get('/analytics/kpis'),
    getRevenueVsOrders: (months = 6) => apiClient.get(`/analytics/revenue-vs-orders?months=${months}`),
};

export default apiClient;