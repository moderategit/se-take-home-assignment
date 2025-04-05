/**
 * Controller for managing order processing in the system
 */
const { OrderStatus, BotStatus } = require('../enums/Status');

class OrderController {
    /**
     * Create a new OrderController
     * @param {SystemFactory} factory - The system factory to use
     */
    constructor(factory) {
        this.factory = factory;
        this.processingInterval = null;
        this.processingOrders = new Set(); // Track orders being processed
        this.orderTimers = new Map(); // Track order timers
    }

    /**
     * Start processing orders
     */
    startProcessing() {
        if (this.processingInterval) {
            return; // Already processing
        }

        // Process orders at the configured refresh rate
        this.processingInterval = setInterval(() => {
            this.processOrders();
            this.updateRemainingTimes();
        }, this.factory.config.controls.refreshRate);
    }

    /**
     * Stop processing orders
     */
    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        
        // Clear all order timers
        this.orderTimers.forEach(timer => clearInterval(timer));
        this.orderTimers.clear();
    }

    /**
     * Update remaining times for all processing orders
     * @private
     */
    updateRemainingTimes() {
        const queues = this.factory.getQueues();
        const allQueues = Object.values(queues);
        
        // Find all processing orders
        allQueues.forEach(queue => {
            const processingOrders = queue.getProcessingOrders();
            processingOrders.forEach(order => {
                // Update remaining time
                if (order.remainingTime > 0) {
                    order.remainingTime = Math.max(0, order.remainingTime - (this.factory.config.controls.refreshRate / 1000));
                }
            });
        });
    }

    /**
     * Process orders in all queues
     * @private
     */
    processOrders() {
        const queues = this.factory.getQueues();
        const bots = this.factory.getBots();
        
        // Get idle bots
        const idleBots = bots.filter(bot => bot.isIdle());
        
        // Process each queue
        Object.values(queues).forEach(queue => {
            // Skip completed queue
            if (queue === queues.completedQueue) {
                return;
            }
            
            // Get pending orders
            const pendingOrders = queue.getPendingOrders();
            
            // Assign idle bots to pending orders
            pendingOrders.forEach(order => {
                // Skip if order is already being processed
                if (this.processingOrders.has(order.id)) {
                    return;
                }
                
                if (idleBots.length > 0) {
                    const bot = idleBots.shift(); // Get next idle bot
                    this.assignBotToOrder(bot, order, queue);
                }
            });
        });
    }

    /**
     * Assign a bot to an order
     * @private
     * @param {Bot} bot - The bot to assign
     * @param {Order} order - The order to process
     * @param {Queue} queue - The queue containing the order
     */
    assignBotToOrder(bot, order, queue) {
        try {
            // Mark order as being processed
            this.processingOrders.add(order.id);
            
            // Calculate processing time based on order type and bot speed
            const baseTime = this.factory.config.orders.baseTime || 10; // Use config value with fallback
            const speedMultiplier = bot.getSpeedMultiplier();
            
            // If the order was previously being processed, use the existing remaining time
            // Otherwise, set it to the full processing time
            if (order.remainingTime === 0) {
                order.remainingTime = baseTime / speedMultiplier;
            }
            
            // Calculate the actual processing time based on the remaining time
            const processingTime = order.remainingTime * speedMultiplier;
            
            // Assign bot to order
            bot.assignOrder(order);
            order.assignBot(bot.id);
            
            // Set timeout for order completion
            const timer = setTimeout(() => {
                this.completeOrder(order, queue);
            }, processingTime * 1000); // Convert to milliseconds
            
            // Store the timer for cleanup
            this.orderTimers.set(order.id, timer);
        } catch (error) {
            console.error(`Error assigning bot to order: ${error.message}`);
            // Remove from processing set if there's an error
            this.processingOrders.delete(order.id);
        }
    }

    /**
     * Complete an order
     * @private
     * @param {Order} order - The order to complete
     * @param {Queue} queue - The queue containing the order
     */
    completeOrder(order, queue) {
        try {
            // Find the bot that was processing this order
            const bot = this.factory.getBots().find(b => b.id === order.botId);
            
            // Complete the order
            order.complete();
            
            // Move to completed queue
            queue.removeOrder(order);
            this.factory.getQueues().completedQueue.addOrder(order);
            
            // Free up the bot and make it idle
            if (bot) {
                bot.completeOrder();
                bot.status = BotStatus.IDLE; // Explicitly set bot status to IDLE
                bot.currentOrderId = null; // Clear the current order ID
            }
            
            // Remove from processing set
            this.processingOrders.delete(order.id);
            
            // Clear the timer
            if (this.orderTimers.has(order.id)) {
                clearTimeout(this.orderTimers.get(order.id));
                this.orderTimers.delete(order.id);
            }
        } catch (error) {
            console.error(`Error completing order: ${error.message}`);
            // Remove from processing set if there's an error
            this.processingOrders.delete(order.id);
            
            // Clear the timer if it exists
            if (this.orderTimers.has(order.id)) {
                clearTimeout(this.orderTimers.get(order.id));
                this.orderTimers.delete(order.id);
            }
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Stop the processing interval
        this.stopProcessing();
        
        // Clear all processing orders
        this.processingOrders.clear();
        
        // Clear all order timers
        this.orderTimers.forEach(timer => clearTimeout(timer));
        this.orderTimers.clear();
    }
}

module.exports = OrderController; 