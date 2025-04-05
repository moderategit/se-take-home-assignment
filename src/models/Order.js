const ProcessingConfig = require('../config/processingConfig');
const { OrderStatus } = require('../enums/Status');

/**
 * Order Class
 * Represents an order in the system
 */
class Order {
    /**
     * Create a new order
     * @param {string} type - The type of order (VIP or Normal)
     * @param {Object} config - The configuration object
     */
    constructor(type, config) {
        if (!config.orders.types.includes(type)) {
            throw new Error(`Invalid order type: ${type}`);
        }
        
        this.id = Date.now(); // Unique ID based on timestamp
        this.type = type;
        this.status = OrderStatus.PENDING;
        this.createdAt = Date.now();
        this.processingTime = config.orders.baseTime; // Fixed base time from config
        this.remainingTime = this.processingTime;
        this.completedAt = null;
        this.botId = null;
    }
    
    /**
     * Get the queue key for this order
     * @returns {string} The queue key
     */
    getQueueKey() {
        return `${this.type.toLowerCase()}Queue`;
    }
    
    /**
     * Assign a bot to this order
     * @param {number} botId - The ID of the bot
     */
    assignBot(botId) {
        this.botId = botId;
        this.status = OrderStatus.PROCESSING;
    }
    
    /**
     * Complete this order
     */
    complete() {
        this.status = OrderStatus.COMPLETE;
        this.completedAt = Date.now();
        this.botId = null;
    }
    
    /**
     * Update the remaining time
     * @param {number} time - The new remaining time
     */
    updateRemainingTime(time) {
        this.remainingTime = time;
    }
    
    /**
     * Check if the order is pending
     * @returns {boolean} True if the order is pending
     */
    isPending() {
        return this.status === OrderStatus.PENDING;
    }
    
    /**
     * Check if the order is processing
     * @returns {boolean} True if the order is processing
     */
    isProcessing() {
        return this.status === OrderStatus.PROCESSING;
    }
    
    /**
     * Check if the order is complete
     * @returns {boolean} True if the order is complete
     */
    isComplete() {
        return this.status === OrderStatus.COMPLETE;
    }
}

module.exports = Order; 