const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('express-async-errors');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth',                   require('./routes/auth.routes'));
app.use('/api/products',               require('./routes/product.routes'));
app.use('/api/operations/receipts',    require('./routes/receipt.routes'));
app.use('/api/operations/deliveries',  require('./routes/delivery.routes'));
app.use('/api/operations/transfers',   require('./routes/transfer.routes'));
app.use('/api/operations/adjustments', require('./routes/adjustment.routes'));
app.use('/api/move-history',           require('./routes/moveHistory.routes'));
app.use('/api/dashboard',              require('./routes/dashboard.routes'));
app.use('/api/settings',               require('./routes/settings.routes'));
app.use('/api/profile',                require('./routes/profile.routes'));

app.use(errorHandler);

module.exports = app;
