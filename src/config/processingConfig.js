/**
 * Processing Configuration
 * This file contains all the configuration settings for the FeedMe Order Processing System
 */
const ProcessingConfig = {
    // Queue configurations
    queues: {
        // Processing queues with priority
        processing: {
            VIP: {
                name: "VIP Queue",
                priority: 1
            },
            Normal: {
                name: "Normal Queue",
                priority: 2
            }
        },
        // Destination queue (completed orders)
        destination: {
            Completed: {
                name: "Completed Queue"
            }
        }
    },
    
    // Order configuration
    orders: {
        baseTime: 10, // Fixed base time of 10 seconds for all orders
        types: ["VIP", "Normal"] // Available order types
    },
    
    // Bot configuration
    bots: {
        defaultSpeed: 1, // Default speed multiplier (1x)
        types: {
            NORMAL: {
                name: "Normal Bot",
                speedMultiplier: 1
            }
        }
    },
    
    // Control settings
    controls: {
        refreshRate: 1000, // Display refresh rate in milliseconds
    }
};

module.exports = ProcessingConfig; 