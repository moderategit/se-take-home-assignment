/**
 * Main entry point for the FeedMe Order Processing System
 */

const SystemFactory = require('./src/factories/SystemFactory');
const OrderController = require('./src/controllers/OrderController');
const CLIInterface = require('./src/cli/interface');

// Create system components
const factory = new SystemFactory();
const controller = new OrderController(factory);
const cli = new CLIInterface(factory, controller);

// Start the application
cli.start();

// Start order processing
controller.startProcessing();

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nCleaning up...');
    controller.cleanup();
    cli.cleanup();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    cli.cleanup();
    controller.cleanup();
    process.exit(1);
}); 