/**
 * Status Enums
 * Contains all status enums used in the system
 */
const OrderStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETE: 'COMPLETE'
};

const BotStatus = {
    IDLE: 'IDLE',
    PROCESSING: 'PROCESSING'
};

module.exports = {
    OrderStatus,
    BotStatus
}; 