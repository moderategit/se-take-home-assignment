const readline = require('readline');
const ProcessingConfig = require('../config/processingConfig');
const { OrderStatus, BotStatus } = require('../enums/Status');

/**
 * CLI Interface for the FeedMe Order Processing System
 */
class CLIInterface {
    /**
     * Create a new CLI Interface
     * @param {SystemFactory} factory - The system factory to use
     * @param {OrderController} controller - The order controller to use
     */
    constructor(factory, controller) {
        this.factory = factory;
        this.controller = controller;
        this.config = ProcessingConfig;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        // Track terminal dimensions
        this.terminalWidth = process.stdout.columns || 80;
        this.terminalHeight = process.stdout.rows || 24;
        
        // Track cursor position
        this.currentY = 0;
        
        // Handle terminal resize
        process.stdout.on('resize', () => {
            this.terminalWidth = process.stdout.columns || 80;
            this.terminalHeight = process.stdout.rows || 24;
            this.refresh();
        });
        
        // Set up refresh interval
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, this.config.controls.refreshRate);
        
        // Current menu state
        this.currentMenu = 'main'; // main, addOrder, addBot, removeBot, config
    }
    
    /**
     * Start the CLI interface
     */
    start() {
        this.clearScreen();
        this.displayLayout();
        this.setupCommandHandler();
    }
    
    /**
     * Clear the screen
     */
    clearScreen() {
        // Use ANSI escape codes to clear the screen
        process.stdout.write('\x1Bc');
    }
    
    /**
     * Display the main layout
     */
    displayLayout() {
        // Display header
        console.log('\x1B[1m=== McDonald Order Processing System ===\x1B[0m');
        console.log('\x1B[1m=====================================\x1B[0m');
        console.log();
        
        // Display main content area
        this.displayStatus();
        
        // Display separator
        console.log('\n\x1B[1m' + '─'.repeat(this.terminalWidth) + '\x1B[0m\n');
        
        // Display menu at the bottom
        this.displayMenu();
    }
    
    /**
     * Display the current system status
     */
    displayStatus() {
        console.log('\x1B[1m=== System Status ===\x1B[0m');
        console.log();
        
        // Get queues and bots from factory
        const queues = this.factory.getQueues();
        const bots = this.factory.getBots();
        
        // Display queues
        this.displayQueues(queues);
        
        // Display bots
        this.displayBots(bots);
    }
    
    /**
     * Display queues and their status
     * @private
     * @param {Object} queues - Object containing all queues
     */
    displayQueues(queues) {
        // Display VIP queue
        if (queues.vipQueue) {
            this.displayQueue(this.config.queues.processing.VIP, queues.vipQueue);
        } else {
            console.log(`  \x1B[33m${this.config.queues.processing.VIP.name}\x1B[0m: No orders`);
        }
        
        // Display Normal queue
        if (queues.normalQueue) {
            this.displayQueue(this.config.queues.processing.Normal, queues.normalQueue);
        } else {
            console.log(`  \x1B[33m${this.config.queues.processing.Normal.name}\x1B[0m: No orders`);
        }
        
        // Display completed queue
        if (queues.completedQueue) {
            this.displayQueue(this.config.queues.destination.Completed, queues.completedQueue);
        } else {
            console.log(`  \x1B[33m${this.config.queues.destination.Completed.name}\x1B[0m: No orders`);
        }
    }
    
    /**
     * Display a specific queue
     * @private
     * @param {Object} queueConfig - Queue configuration
     * @param {Queue} queue - Queue object
     */
    displayQueue(queueConfig, queue) {
        console.log(`  \x1B[33m${queueConfig.name}\x1B[0m:`);
        
        if (queue.isEmpty()) {
            console.log('    No orders');
        } else {
            // Determine which statuses to display based on queue type
            let ordersToDisplay = [];
            
            if (queueConfig.name === this.config.queues.destination.Completed.name) {
                // For completed queue, only show completed orders
                ordersToDisplay = queue.getCompletedOrders();
            } else {
                // For processing queues, show pending and processing orders
                ordersToDisplay = [...queue.getPendingOrders(), ...queue.getProcessingOrders()];
            }
            
            if (ordersToDisplay.length === 0) {
                console.log('    No orders');
            } else {
                ordersToDisplay.forEach(order => {
                    let statusText = '';
                    let statusColor = '';
                    
                    if (order.isComplete()) {
                        statusText = 'COMPLETE';
                        statusColor = '\x1B[32m'; // Green
                    } else if (order.isProcessing()) {
                        statusText = 'PROCESSING';
                        statusColor = '\x1B[36m'; // Cyan
                    } else {
                        statusText = 'PENDING';
                        statusColor = '\x1B[33m'; // Yellow
                    }
                    
                    const timeInfo = order.isProcessing() ? 
                        ` (${order.remainingTime.toFixed(1)}s remaining)` : '';
                    
                    console.log(`    Order #${order.id} (${order.type}) - ${statusColor}${statusText}\x1B[0m${timeInfo}`);
                });
            }
        }
    }
    
    /**
     * Display bots and their status
     * @private
     * @param {Bot[]} bots - Array of bots
     */
    displayBots(bots) {
        console.log('  \x1B[33mBots\x1B[0m:');
        
        if (bots.length === 0) {
            console.log('    No bots available');
        } else {
            bots.forEach(bot => {
                let statusText = '';
                let statusColor = '';
                
                if (bot.isProcessing()) {
                    statusText = 'PROCESSING';
                    statusColor = '\x1B[36m'; // Cyan
                } else {
                    statusText = 'IDLE';
                    statusColor = '\x1B[32m'; // Green
                }
                
                const orderInfo = bot.isProcessing() ? 
                    ` (Order #${bot.currentOrderId})` : '';
                
                console.log(`    Bot #${bot.id} (${bot.type}) - ${statusColor}${statusText}\x1B[0m${orderInfo}`);
            });
        }
    }
    
    /**
     * Display the menu
     */
    displayMenu() {
        console.log('\x1B[1m=== Menu ===\x1B[0m');
        
        if (this.currentMenu === 'main') {
            console.log('\x1B[36m1\x1B[0m. Add Order');
            console.log('\x1B[36m2\x1B[0m. Add Bot');
            console.log('\x1B[36m3\x1B[0m. Remove Bot');
            console.log('\x1B[36m4\x1B[0m. Show Config');
            console.log('\x1B[36m5\x1B[0m. Exit');
        } else if (this.currentMenu === 'addOrder') {
            console.log('\x1B[36m1\x1B[0m. VIP Order');
            console.log('\x1B[36m2\x1B[0m. Normal Order');
            console.log('\x1B[36m3\x1B[0m. Back to Main Menu');
        } else if (this.currentMenu === 'addBot') {
            console.log('\x1B[36m1\x1B[0m. Add Normal Bot');
            console.log('\x1B[36m2\x1B[0m. Back to Main Menu');
        } else if (this.currentMenu === 'removeBot') {
            const bots = this.factory.getBots();
            if (bots.length === 0) {
                console.log('No bots available to remove.');
                console.log('\x1B[36m1\x1B[0m. Back to Main Menu');
            } else {
                // Show the newest bot that will be removed
                const newestBot = bots[bots.length - 1];
                const status = newestBot.isProcessing() ? 'PROCESSING' : 'IDLE';
                console.log(`Remove newest bot: Bot #${newestBot.id} (${status})`);
                console.log('\x1B[36m1\x1B[0m. Confirm Removal');
                console.log('\x1B[36m2\x1B[0m. Back to Main Menu');
            }
        } else if (this.currentMenu === 'config') {
            this.displayConfig();
            console.log('\x1B[36m1\x1B[0m. Back to Main Menu');
        }
        
        console.log();
    }
    
    /**
     * Display configuration settings
     * @private
     */
    displayConfig() {
        // Display header
        console.log('\x1B[1m=== Configuration Settings ===\x1B[0m');
        console.log();
        
        // Display Queue Settings
        console.log('\x1B[33mQueue Settings\x1B[0m:');
        console.log(`  VIP Queue Base Time: ${this.config.orders.baseTime} seconds`);
        console.log(`  Normal Queue Base Time: ${this.config.orders.baseTime} seconds`);
        console.log();
        
        // Display Bot Settings
        console.log('\x1B[33mBot Settings\x1B[0m:');
        console.log(`  Normal Bot Speed Multiplier: ${this.config.bots.types.NORMAL.speedMultiplier}x`);
        console.log();
        
        // Display System Settings
        console.log('\x1B[33mSystem Settings\x1B[0m:');
        console.log(`  Display Refresh Rate: ${this.config.controls.refreshRate} milliseconds`);
    }
    
    /**
     * Setup command handler
     * @private
     */
    setupCommandHandler() {
        let prompt = '';
        
        if (this.currentMenu === 'main') {
            prompt = 'Enter command (1-5): ';
        } else if (this.currentMenu === 'addOrder') {
            prompt = 'Enter command (1-3): ';
        } else if (this.currentMenu === 'addBot') {
            prompt = 'Enter command (1-2): ';
        } else if (this.currentMenu === 'removeBot') {
            const bots = this.factory.getBots();
            prompt = `Enter command (1-${bots.length + 1}): `;
        } else if (this.currentMenu === 'config') {
            prompt = 'Press Enter to return to main menu: ';
        }
        
        this.rl.question(prompt, (answer) => {
            const command = answer.trim();
            
            if (this.currentMenu === 'main') {
                this.handleMainMenu(command);
            } else if (this.currentMenu === 'addOrder') {
                this.handleAddOrderMenu(command);
            } else if (this.currentMenu === 'addBot') {
                this.handleAddBotMenu(command);
            } else if (this.currentMenu === 'removeBot') {
                this.handleRemoveBotMenu(command);
            } else if (this.currentMenu === 'config') {
                this.currentMenu = 'main';
                this.refresh();
            }
        });
    }
    
    /**
     * Handle main menu commands
     * @private
     * @param {string} command - The command entered
     */
    handleMainMenu(command) {
        switch (command) {
            case '1':
                this.currentMenu = 'addOrder';
                this.refresh();
                break;
            case '2':
                this.currentMenu = 'addBot';
                this.refresh();
                break;
            case '3':
                this.currentMenu = 'removeBot';
                this.refresh();
                break;
            case '4':
                this.currentMenu = 'config';
                this.refresh();
                break;
            case '5':
                this.cleanup();
                process.exit(0);
                break;
            default:
                this.refresh();
        }
    }
    
    /**
     * Handle add order menu commands
     * @private
     * @param {string} command - The command entered
     */
    handleAddOrderMenu(command) {
        switch (command) {
            case '1':
                this.addOrder('VIP');
                break;
            case '2':
                this.addOrder('Normal');
                break;
            case '3':
                this.currentMenu = 'main';
                this.refresh();
                break;
            default:
                this.refresh();
        }
    }
    
    /**
     * Handle add bot menu commands
     * @private
     * @param {string} command - The command entered
     */
    handleAddBotMenu(command) {
        switch (command) {
            case '1':
                this.addBot('NORMAL');
                break;
            case '2':
                this.currentMenu = 'main';
                this.refresh();
                break;
            default:
                this.refresh();
        }
    }
    
    /**
     * Handle remove bot menu commands
     * @private
     * @param {string} command - The command entered
     */
    handleRemoveBotMenu(command) {
        const bots = this.factory.getBots();
        
        if (bots.length === 0) {
            if (command === '1') {
                this.currentMenu = 'main';
                this.refresh();
            } else {
                this.refresh();
            }
            return;
        }
        
        // Only allow removing the newest bot (last one in the array)
        if (command === '1') {
            this.removeBot();
        } else if (command === '2') {
            this.currentMenu = 'main';
            this.refresh();
        } else {
            this.refresh();
        }
    }
    
    /**
     * Add an order
     * @private
     * @param {string} type - The type of order
     */
    addOrder(type) {
        try {
            const order = this.factory.createOrder(type);
            
            // Add order to the appropriate queue
            const queueKey = order.getQueueKey();
            const queues = this.factory.getQueues();
            queues[queueKey].addOrder(order);
            
            console.log(`\x1B[32mOrder added successfully!\x1B[0m`);
            setTimeout(() => {
                this.currentMenu = 'main';
                this.refresh();
            }, 1000);
        } catch (error) {
            console.log(`\x1B[31mError adding order: ${error.message}\x1B[0m`);
            setTimeout(() => {
                this.currentMenu = 'main';
                this.refresh();
            }, 2000);
        }
    }
    
    /**
     * Add a bot
     * @private
     * @param {string} type - The type of bot
     */
    addBot(type) {
        try {
            this.factory.createBot(type);
            console.log(`\x1B[32mBot added successfully!\x1B[0m`);
            setTimeout(() => {
                this.currentMenu = 'main';
                this.refresh();
            }, 1000);
        } catch (error) {
            console.log(`\x1B[31mError adding bot: ${error.message}\x1B[0m`);
            setTimeout(() => {
                this.currentMenu = 'main';
                this.refresh();
            }, 2000);
        }
    }
    
    /**
     * Remove the newest bot
     * @private
     */
    removeBot() {
        try {
            const bots = this.factory.getBots();
            if (bots.length > 0) {
                // Get the newest bot (last one in the array)
                const botToRemove = bots[bots.length - 1];
                
                // If bot is processing an order, find the order and set it back to pending
                if (botToRemove.isProcessing()) {
                    const queues = this.factory.getQueues();
                    const allQueues = Object.values(queues);
                    
                    // Find the order in any queue
                    let orderToUpdate = null;
                    let queueWithOrder = null;
                    
                    for (const queue of allQueues) {
                        const orders = queue.getOrders();
                        const order = orders.find(o => o.id === botToRemove.currentOrderId);
                        if (order) {
                            orderToUpdate = order;
                            queueWithOrder = queue;
                            break;
                        }
                    }
                    
                    if (orderToUpdate) {
                        // Set order back to pending
                        orderToUpdate.status = OrderStatus.PENDING;
                        orderToUpdate.botId = null;
                        
                        // Remove from processing orders set in the controller
                        this.controller.processingOrders.delete(orderToUpdate.id);
                        
                        // Clear any existing timer for this order
                        if (this.controller.orderTimers.has(orderToUpdate.id)) {
                            clearTimeout(this.controller.orderTimers.get(orderToUpdate.id));
                            this.controller.orderTimers.delete(orderToUpdate.id);
                        }
                    }
                }
                
                // Remove the bot (newest one)
                this.factory.removeBot();
                console.log(`\x1B[32mBot removed successfully!\x1B[0m`);
                setTimeout(() => {
                    this.currentMenu = 'main';
                    this.refresh();
                }, 1000);
            } else {
                console.log(`\x1B[31mNo bots available to remove.\x1B[0m`);
                setTimeout(() => {
                    this.currentMenu = 'main';
                    this.refresh();
                }, 1000);
            }
        } catch (error) {
            console.log(`\x1B[31mError removing bot: ${error.message}\x1B[0m`);
            setTimeout(() => {
                this.currentMenu = 'main';
                this.refresh();
            }, 2000);
        }
    }
    
    /**
     * Refresh the display
     */
    refresh() {
        this.clearScreen();
        this.displayLayout();
        this.setupCommandHandler();
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        console.log('\x1B[33mCleaning up resources...\x1B[0m');
        
        // Clear refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Clean up controller
        if (this.controller) {
            this.controller.cleanup();
        }
        
        // Clean up factory
        if (this.factory) {
            this.factory.cleanup();
        }
        
        // Close readline interface
        this.rl.close();
        
        console.log('\x1B[32mCleanup complete. Goodbye!\x1B[0m');
    }
}

module.exports = CLIInterface; 