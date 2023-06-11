import asyncHandler from 'express-async-handler'
import Product from '../models/productModel.js'

// @desc Fetch All Products
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  // We define a page size, which is the number of items per page.
  const pageSize = 10
  // We get the page number from the request query parameters, defaulting to 1 if it isn't provided.
  const page = Number(req.query.pageNumber) || 1
  
  // We look for a keyword in the request query parameters. This is for search functionality.
  // If a keyword is provided, we create a case-insensitive regular expression pattern for MongoDB to match product names.
  // The `req.query` object represents the parsed query string parameters of the request's URL.
// In this case, `req.query.keyword` would be the value of a "keyword" parameter if it were present.
// For example, if the request URL was "/api/products?keyword=sneakers", then `req.query.keyword` would be "sneakers".
  const keyword = req.query.keyword
  // The "?" character starts a ternary operation, which is a simpler form of an if/else statement.
  // It checks if `req.query.keyword` is truthy - if it exists and is not empty.
    ? {
      // If `req.query.keyword` is truthy, this creates a new object. This object will be used as a condition in a MongoDB query.
        name: {
          // The `$regex` operator is a MongoDB operator that matches documents with fields that contain values matching a specified regular expression.
          // Here, it is set to `req.query.keyword`, so it will match any "name" fields in the database that contain the keyword.
          $regex: req.query.keyword,
          // The `$options` operator provides options for the `$regex` operator. Here 'i' is passed as an option which makes the regex case-insensitive.
          // So, if `req.query.keyword` was "sneakers", it would match "Sneakers", "SNEAKERS", "sNeAkErS", etc.
          $options: 'i',
        },
      }
   // The ":" character separates the "if" and "else" parts of the ternary operation.
    : {} // If `req.query.keyword` is falsy (does not exist or is empty), an empty object is returned.
  // So, `keyword` is either an object that can be used to filter MongoDB documents by the "name" field, or it is an empty object.
  // We count how many products match our keyword criteria.
  const count = await Product.count({ ...keyword })
  // We find all products that match our keyword criteria, limit the results to our page size, 
  // and skip the products of the previous pages.
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
  // We return the products, the current page number, and the total number of pages.
  res.json({ products, page, pages: Math.ceil(count / pageSize) })
})

// Rest of the code is similar, following the same pattern of handling the request and sending back a response.
// It first verifies if the resource (product, in this case) exists, then performs some actions (fetching data, 
// updating data, deleting data, etc.) and sends back the appropriate data or error message.
// Some routes are protected and can only be accessed by an admin, such as deleteProduct, createProduct, updateProduct.
// `getProductById` is for getting a specific product's details.
// `createProductReview` allows logged-in users to add a product review.
// `getTopProducts` fetches the top three products sorted by rating.

// @desc Fetch Single Products
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    res.json(product)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc Delete a Product
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    await product.remove()
    res.json({ message: 'Product Removed' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc Create a Product
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample Name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})

// @desc Update a Product
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    product.name = name
    product.price = price
    product.description = description
    product.image = image
    product.brand = brand
    product.countInStock = countInStock

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc Create new review
// @route POST /api/products/:id/reviews
// @access Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
      res.status(400)
      throw new Error('Product already reviewed')
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    }

    product.reviews.push(review)

    product.numReviews = product.reviews.length

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length

    await product.save()
    res.status(201).json({ message: 'Review added' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc Get top rated products
// @route GET /api/products/top
// @access Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)
  res.json(products)
})
// Exporting the functions (endpoints) so they can be used in other files.
export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
}
