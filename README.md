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

## FeedMe Software Engineer Take Home Assignment
Below is a take home assignment before the interview of the position. You are required to
1. Understand the situation and use case. You may contact the interviewer for further clarification.
2. Fork this repo and implement the requirement with your most familiar tools.
3. Complete the requirement and perform your own testing.
4. Provide documentation for the any part that you think is needed.
5. Commit into your own github and share your repo with the interviewer.
6. Bring the source code and functioning prototype to the interview session.

### Situation
McDonald is transforming their business during COVID-19. They wish to build the automated cooking bots to reduce workforce and increase their efficiency. As one of the software engineer in the project. You task is to create an order controller which handle the order control flow. 

### User Story
As below is part of the user story:
1. As McDonald's normal customer, after I submitted my order, I wish to see my order flow into "PENDING" area. After the cooking bot process my order, I want to see it flow into to "COMPLETE" area.
2. As McDonald's VIP member, after I submitted my order, I want my order being process first before all order by normal customer.  However if there's existing order from VIP member, my order should queue behind his/her order.
3. As McDonald's manager, I want to increase or decrease number of cooking bot available in my restaurant. When I increase a bot, it should immediately process any pending order. When I decrease a bot, the processing order should remain un-process.
4. As McDonald bot, it can only pickup and process 1 order at a time, each order required 10 seconds to complete process.

### Requirements
1. When "New Normal Order" clicked, a new order should show up "PENDING" Area.
2. When "New VIP Order" clicked, a new order should show up in "PENDING" Area. It should place in-front of all existing "Normal" order but behind of all existing "VIP" order.
3. The order number should be unique and increasing.
4. When "+ Bot" clicked, a bot should be created and start processing the order inside "PENDING" area. after 10 seconds picking up the order, the order should move to "COMPLETE" area. Then the bot should start processing another order if there is any left in "PENDING" area.
5. If there is no more order in the "PENDING" area, the bot should become IDLE until a new order come in.
6. When "- Bot" clicked, the newest bot should be destroyed. If the bot is processing an order, it should also stop the process. The order now back to "PENDING" and ready to process by other bot.
7. No data persistance is needed for this prototype, you may perform all the process inside memory.

### Functioning Prototype
You may demostrate your final funtioning prototype with **one and only one** of the following method:
- CLI application
- UI application
- E2E test case

### Tips on completing this task
- Testing, testing and testing. Make sure the prototype is functioning and meeting all the requirements.
- Do not over engineering. Try to scope your working hour within 3 hours (1 hour per day). You may document all the optimization or technology concern that you think good to bring in the solution.
- Complete the implementation as clean as possible, clean code is a strong plus point, do not bring in all the fancy tech stuff.

