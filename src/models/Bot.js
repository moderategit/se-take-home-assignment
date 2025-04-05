const ProcessingConfig = require('../config/processingConfig');
const { BotStatus } = require('../enums/Status');

/**
 * Bot Class
 * Represents a bot in the system
 */
class Bot {
    /**
     * Create a new bot
     * @param {string} type - The type of bot
     * @param {Object} config - The configuration object
     */
    constructor(type, config) {
        if (!config.bots.types[type]) {
            throw new Error(`Invalid bot type: ${type}`);
        }
        
        this.id = Date.now(); // Unique ID based on timestamp
        this.type = type;
        this.status = BotStatus.IDLE;
        this.currentOrderId = null;
        this.speedMultiplier = config.bots.types[type].speedMultiplier;
    }
    
    /**
     * Assign an order to this bot
     * @param {Order} order - The order to assign
     */
    assignOrder(order) {
        if (this.status !== BotStatus.IDLE) {
            throw new Error('Bot is not idle');
        }
        
        this.status = BotStatus.PROCESSING;
        this.currentOrderId = order.id;
    }
    
    /**
     * Complete the current order
     */
    completeOrder() {
        this.status = BotStatus.IDLE;
        this.currentOrderId = null;
    }
    
    /**
     * Get the speed multiplier of this bot
     * @returns {number} The speed multiplier
     */
    getSpeedMultiplier() {
        return this.speedMultiplier;
    }
    
    /**
     * Check if the bot is idle
     * @returns {boolean} True if the bot is idle
     */
    isIdle() {
        return this.status === BotStatus.IDLE;
    }
    
    /**
     * Check if the bot is processing an order
     * @returns {boolean} True if the bot is processing
     */
    isProcessing() {
        return this.status === BotStatus.PROCESSING;
    }
}

module.exports = Bot; 