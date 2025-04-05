/**
 * System Factory
 * Creates and manages system components based on configuration
 */
const Order = require('../models/Order');
const Queue = require('../models/Queue');
const Bot = require('../models/Bot');
const ProcessingConfig = require('../config/processingConfig');

class SystemFactory {
    /**
     * Create a new system factory
     */
    constructor() {
        this.config = ProcessingConfig;
        this.queues = {};
        this.bots = [];
        this.initializeQueues();
    }
    
    /**
     * Initialize all queues based on configuration
     * @private
     */
    initializeQueues() {
        // Create processing queues
        for (const [type, queueConfig] of Object.entries(this.config.queues.processing)) {
            this.queues[`${type.toLowerCase()}Queue`] = new Queue(
                queueConfig.name,
                queueConfig.priority,
                this.config
            );
        }
        
        // Create destination queue
        for (const [type, queueConfig] of Object.entries(this.config.queues.destination)) {
            this.queues[`${type.toLowerCase()}Queue`] = new Queue(
                queueConfig.name,
                null, // No priority for destination queue
                this.config
            );
        }
    }
    
    /**
     * Create a new order
     * @param {string} type - The type of order (VIP or Normal)
     * @returns {Order} The created order
     */
    createOrder(type) {
        return new Order(type, this.config);
    }
    
    /**
     * Create a new bot
     * @param {string} type - The type of bot (NORMAL)
     * @returns {Bot} The created bot
     */
    createBot(type) {
        const bot = new Bot(type, this.config);
        this.bots.push(bot);
        return bot;
    }
    
    /**
     * Get all queues
     * @returns {Object} Object containing all queues
     */
    getQueues() {
        return this.queues;
    }
    
    /**
     * Get all bots
     * @returns {Bot[]} Array of all bots
     */
    getBots() {
        return this.bots;
    }
    
    /**
     * Get idle bots
     * @returns {Bot[]} Array of idle bots
     */
    getIdleBots() {
        return this.bots.filter(bot => bot.isIdle());
    }
    
    /**
     * Remove the newest bot (last added)
     * @returns {Bot|null} The removed bot or null if no bots exist
     */
    removeBot() {
        if (this.bots.length === 0) {
            return null;
        }
        return this.bots.pop(); // Remove and return the last bot (newest)
    }
    
    /**
     * Clean up all resources
     */
    cleanup() {
        // Clear all queues
        Object.values(this.queues).forEach(queue => {
            queue.clear();
        });
        this.queues = {};
        
        // Clear all bots
        this.bots = [];
    }
}

module.exports = SystemFactory; 