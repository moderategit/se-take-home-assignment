# McDonald Order Processing System

A command-line interface (CLI) application for managing order processing with bots. The system handles VIP and normal orders with different priority levels and processing times.

## Features

- **Order Management**
  - Support for VIP and Normal orders
  - Priority-based processing
  - Real-time order status tracking
  - Automatic order completion

- **Bot Management**
  - Add and remove bots dynamically
  - Bot speed multipliers for faster processing
  - Automatic order assignment to idle bots

- **Queue System**
  - Separate queues for VIP and Normal orders
  - Priority-based order processing
  - Completed orders tracking
  - Maximum limit for completed orders display

- **User Interface**
  - Clear, color-coded display
  - Real-time status updates
  - Interactive menu system
  - Configuration display

## Prerequisites

- Node.js (v18 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd FeedMe
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the application:
```bash
node index.js
```

2. Use the menu options:
   - `1`: Add Order (VIP or Normal)
   - `2`: Add Bot
   - `3`: Remove Bot
   - `4`: Show Configuration
   - `5`: Exit

## Configuration

The system can be configured through `src/config/processingConfig.js`:

- **Order Processing**
  - Base processing time for orders
  - VIP and Normal order types

- **Bot Settings**
  - Bot types and speed multipliers
  - Processing capabilities

- **Queue Settings**
  - Queue priorities
  - Maximum completed orders display limit

- **System Controls**
  - Display refresh rate
  - Order processing intervals

## Project Structure

```
FeedMe/
├── src/
│   ├── cli/
│   │   └── interface.js       # CLI interface implementation
│   ├── config/
│   │   └── processingConfig.js # System configuration
│   ├── controllers/
│   │   └── OrderController.js # Order processing logic
│   ├── enums/
│   │   └── Status.js         # Status enums
│   ├── factories/
│   │   └── SystemFactory.js  # System component factory
│   └── models/
│       ├── Bot.js            # Bot model
│       ├── Order.js          # Order model
│       └── Queue.js          # Queue model
├── index.js                  # Application entry point
└── README.md                 # This file
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 