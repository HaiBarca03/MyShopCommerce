const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const dbConnect = require('./src/config/db')
const schedule = require('node-schedule');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// router
const userRouter = require('./src/v1/routers/userRouter')
const productRouter = require('./src/v1/routers/productRouter')
const categoryRouter = require('./src/v1/routers/categoryRouter')
const variantRouter = require('./src/v1/routers/VariantRouter')
const saleRouter = require('./src/v1/routers/saleRouter')
const couponRouter = require('./src/v1/routers/couponRouter')
const addressRouter = require('./src/v1/routers/addressRouter')
const wishRouter = require('./src/v1/routers/wishRouter')
const compareRouter = require('./src/v1/routers/compareRouter')
const cartRouter = require('./src/v1/routers/cartRouter')
const orderRouter = require('./src/v1/routers/orderRouter')
const paymentRouter = require('./src/v1/routers/paymentRouter')
const shippingRouter = require('./src/v1/routers/shippingRouter')
const reviewsRouter = require('./src/v1/routers/reviewsRouter')

const app = express()

// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce API',
            version: '1.0.0',
            description: 'API for managing all in an e-commerce application',
            contact: {
                name: 'DucHai',
                email: 'doanduchai@gmail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Local server',
            },
        ],
    },
    apis: ['./src/v1/routers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// config
const port = process.env.PORT || 4000
app.use(express.json())
app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb' }));
app.use(bodyParser.json())
// app.use(cors())
app.use(cookieParser())
require('dotenv').config()
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));

// schedule
const { deleteExpiredCoupons } = require('./src/v1/controllers/couponController')
const job = schedule.scheduleJob('0 0 * * *', () => {
    console.log('Running a job to delete expired coupons...');
    deleteExpiredCoupons();
});

// db connect
dbConnect()

// api
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/category', categoryRouter)
app.use('/api/variant', variantRouter)
app.use('/api/sale', saleRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/address', addressRouter)
app.use('/api/wish', wishRouter)
app.use('/api/compare', compareRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/ship', shippingRouter)
app.use('/api/review', reviewsRouter)

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.listen(port, () => {
    console.log(`App running on port: ${port}`)
})