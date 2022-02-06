const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const path = require('path');
const fileUpload = require('express-fileupload');

// route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

// Connect DB
connectDB();

// Body Parser
app.use(express.json());

// Middlewares
if (process.env.NODE_ENV == 'development') app.use(morgan('dev'));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection: ${err.message}`.red.underline.bold);
  server.close(() => process.exit(1));
});
