const { OrderStatus } = require('../enums/Status');

/**
 * Queue Class
 * Represents a queue in the system
 */
class Queue {
    /**
     * Create a new queue
     * @param {string} name - The name of the queue
     * @param {number} priority - The priority of the queue
     * @param {Object} config - The configuration object
     */
    constructor(name, priority, config) {
        this.name = name;
        this.priority = priority;
        this.config = config;
        this.orders = [];
    }
    
    /**
     * Add an order to the queue
     * @param {Order} order - The order to add
     */
    addOrder(order) {
        this.orders.push(order);
        // Sort orders by priority if this is a processing queue
        if (this.priority) {
            this.orders.sort((a, b) => {
                const aPriority = this.config.queues.processing[a.type].priority;
                const bPriority = this.config.queues.processing[b.type].priority;
                return aPriority - bPriority;
            });
        }
    }
    
    /**
     * Remove an order from the queue
     * @param {Order} order - The order to remove
     * @returns {boolean} True if the order was removed, false otherwise
     */
    removeOrder(order) {
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
            this.orders.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Get all orders in the queue
     * @returns {Order[]} Array of orders
     */
    getOrders() {
        return this.orders;
    }
    
    /**
     * Get orders by status
     * @param {string} status - The status to filter by
     * @returns {Order[]} Array of orders with the specified status
     */
    getOrdersByStatus(status) {
        return this.orders.filter(order => order.status === status);
    }
    
    /**
     * Get pending orders
     * @returns {Order[]} Array of pending orders
     */
    getPendingOrders() {
        return this.getOrdersByStatus(OrderStatus.PENDING);
    }
    
    /**
     * Get processing orders
     * @returns {Order[]} Array of processing orders
     */
    getProcessingOrders() {
        return this.getOrdersByStatus(OrderStatus.PROCESSING);
    }
    
    /**
     * Get completed orders
     * @returns {Order[]} Array of completed orders
     */
    getCompletedOrders() {
        return this.getOrdersByStatus(OrderStatus.COMPLETE);
    }
    
    /**
     * Get the next order in the queue
     * @returns {Order|null} The next order or null if the queue is empty
     */
    getNextOrder() {
        return this.orders.length > 0 ? this.orders[0] : null;
    }
    
    /**
     * Check if the queue is empty
     * @returns {boolean} True if the queue is empty
     */
    isEmpty() {
        return this.orders.length === 0;
    }
    
    /**
     * Get the number of orders in the queue
     * @returns {number} The number of orders
     */
    size() {
        return this.orders.length;
    }
    
    /**
     * Clear all orders from the queue
     */
    clear() {
        this.orders = [];
    }
}

module.exports = Queue; 