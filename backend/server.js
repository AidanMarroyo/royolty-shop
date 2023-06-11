import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/db.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

// Load the dotenv package to read values from a .env file into process.env.
dotenv.config()

// Connect to your MongoDB database using the connectDB function defined elsewhere.
connectDB()

// Create an instance of an Express application. Express is a popular Node.js web application framework.
const app = express()

// If the application is running in development mode (as defined in the .env file), 
// use morgan (a middleware for logging HTTP requests) in 'dev' mode for verbose output.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Use the express.json middleware. This allows Express to parse incoming requests with JSON payloads.
app.use(express.json())

// Define the routes for your Express application. 
// Here we're saying "When a request starts with '/api/products', use the routes defined in productRoutes".
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)

// Define an endpoint for fetching the PayPal client ID from the environment variables.
app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
)

// Serve the files in the "/uploads" directory as static resources that can be accessed directly via URL.
const folder = path.resolve()
app.use('/uploads', express.static(path.join(folder, '/uploads')))

// Check if the application is running in production mode.
if (process.env.NODE_ENV === 'production') {
  
   // If it is, serve the static files from the "frontend/build" directory.
  // These are the compiled and ready-to-serve files of your React application.
  app.use(express.static(path.join(folder, '/frontend/build')))
  app.use(express.static(path.join(folder, '/frontend/build')))

   // Define a wildcard route handler for any requests that do not match the previously defined routes.
  // This will respond with the main "index.html" file of your React application, enabling client-side routing.
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(folder, 'frontend', 'build', 'index.html'))
  )
} else {
   // If the application is not in production, respond to the root URL with a simple message.
  app.get('/', (req, res) => {
    res.send('API is running...')
  })
}

// Use the "notFound" middleware (defined elsewhere) to handle any requests to routes not explicitly defined in this file.
app.use(notFound)

// Use the "errorHandler" middleware (defined elsewhere) to handle any errors that occur while handling requests.
app.use(errorHandler)

// Define the port that your Express application will listen on, 
// defaulting to 5000 if no PORT environment variable is defined.
const PORT = process.env.PORT || 5000

// Start the server, listening on the defined port.
app.listen(
  PORT,
  console.log(
    // Log to the console that the server is running, indicating the environment and the port.
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
)
