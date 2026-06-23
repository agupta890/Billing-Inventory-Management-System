const Product = require("../models/product-model");
const Inventory = require("../models/inventory-model");
const status_code = require("../utils/status-code");

// Get all products (with search and filters)
const getProducts = async (req, res) => {
  try {
    const { search, category, status, sort } = req.query;
    
    let query = {};
    
    // Search by title, author or isbn
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }

    let apiQuery = Product.find(query);

    // Sorting
    if (sort) {
      const sortList = sort.split(",").join(" ");
      apiQuery = apiQuery.sort(sortList);
    } else {
      apiQuery = apiQuery.sort("-createdAt");
    }

    const products = await apiQuery;
    res.status(status_code.OK).json({ count: products.length, products });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Add new product (Owner Only)
const addProduct = async (req, res) => {
  try {
    const { title, author, isbn, category, description, price, costPrice, stock, image, supplier, reorderLevel } = req.body;

    if (!title || !author || !category || !price) {
      return res.status(status_code.BAD_REQUEST).json({ message: "Title, author, category, and price are required" });
    }

    // Check unique isbn if provided
    if (isbn) {
      const existProduct = await Product.findOne({ isbn });
      if (existProduct) {
        return res.status(status_code.CONFLICT).json({ message: "Product with this ISBN already exists" });
      }
    }

    const newProduct = await Product.create({
      title,
      author,
      isbn,
      category,
      description,
      price,
      costPrice,
      stock: stock || 0,
      image: image || { public_id: "", url: "" },
      supplier,
      reorderLevel: reorderLevel || 10,
      createdBy: req.user._id
    });

    // Create an inventory log for initial stock if stock > 0
    if (stock && stock > 0) {
      await Inventory.create({
        productId: newProduct._id,
        quantity: stock,
        type: "add",
        reason: "Initial stock registration",
        recordedBy: req.user._id
      });
    }

    res.status(status_code.CREATED).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Get single product details
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(status_code.NOT_FOUND).json({ message: "Product not found" });
    }
    res.status(status_code.OK).json({ product });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Update product (Owner Only)
const updateProduct = async (req, res) => {
  try {
    const { title, author, isbn, category, description, price, costPrice, stock, image, supplier, reorderLevel, status } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(status_code.NOT_FOUND).json({ message: "Product not found" });
    }

    // Check unique isbn if updating to a new isbn
    if (isbn && isbn !== product.isbn) {
      const existProduct = await Product.findOne({ isbn });
      if (existProduct) {
        return res.status(status_code.CONFLICT).json({ message: "Product with this ISBN already exists" });
      }
    }

    // If stock changes directly in request, record inventory transaction
    if (stock !== undefined && stock !== product.stock) {
      const diff = stock - product.stock;
      await Inventory.create({
        productId: product._id,
        quantity: diff,
        type: diff > 0 ? "add" : "remove",
        reason: "Manual adjustment via product edit",
        recordedBy: req.user._id
      });
      product.stock = stock;
    }

    if (title) product.title = title;
    if (author) product.author = author;
    if (isbn !== undefined) product.isbn = isbn;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (costPrice !== undefined) product.costPrice = costPrice;
    if (image) product.image = image;
    if (supplier !== undefined) product.supplier = supplier;
    if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;
    if (status) product.status = status;

    await product.save();
    res.status(status_code.OK).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

// Delete product (Owner Only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(status_code.NOT_FOUND).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    
    // Also delete inventory logs for this product to keep db clean
    await Inventory.deleteMany({ productId: req.params.id });

    res.status(status_code.OK).json({ message: "Product and associated inventory logs deleted successfully" });
  } catch (error) {
    res.status(status_code.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct
};
