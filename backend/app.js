const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const { notFound } = require('./middleware/notFound');
const errorMiddleware = require('./middleware/error');
//import all the routes
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');

/* middleware */
// app.use(express.static("./public"));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

/* base route */
app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);

//middleware
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
