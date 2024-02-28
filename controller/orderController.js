const mongoose = require('mongoose');
const Order = require('../models/order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer();

exports.placeOrder = async (req, res) => {
    try {
        const { userId, foodId, paymentMode, quantity } = req.body;

        // Convert userId to ObjectId
        const userIdObject =new mongoose.Types.ObjectId(userId);

        const newOrder = new Order({
            userId: userIdObject,
            foodId,
            paymentMode,
            quantity,
            orderId: generateOrderId(), 
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newOrder.save();

        res.json({ success: true, message: 'Order placed successfully', orderId: newOrder.orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.submitFeedback = async (req, res) => {
    try {
        console.log(req.body);
        const { rating, imageLink } = req.body;
        const orderId = req.params.orderId;

        console.log('orderId:', orderId);

        // Handle file upload with multer middleware
        upload.single('file')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                console.error(err);
                return res.status(500).json({ error: 'File upload error' });
            } else if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Optional: Handle file upload and extract text data
            const textData = await extractTextFromFile(req.file);

            // Update order with feedback data
            const updatedOrder = await Order.findByIdAndUpdate(orderId, {
                rating,
                imageLink,
                fileData: textData ? textData.link : null,
                updatedAt: new Date()
            }, { new: true });

            console.log('updatedOrder:', updatedOrder);

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.json({ success: true, message: 'Feedback submitted successfully', updatedOrder });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

function generateOrderId() {
    // Generate a random alphanumeric string or use a UUID generator library
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Function to extract text from uploaded file and store it as a link
async function extractTextFromFile(file) {
    if (!file) {
        return null;
    }

    try {
        // Assuming 'extractTextFromUploadedFile' is a function to extract text from file
        const extractedText = await extractTextFromUploadedFile(file.path);

        // Save extracted text to a new file
        const textFilePath = `uploads/text_${Date.now()}.txt`;
        fs.writeFileSync(textFilePath, extractedText);

        // Return the link to the extracted text file
        return { link: textFilePath };
    } catch (error) {
        console.error('Error extracting text from file:', error);
        return null;
    }
}

// Placeholder function for text extraction (replace with actual implementation)
async function extractTextFromUploadedFile(filePath) {
    // Here you should implement code to extract text from the uploaded file
    // Example: Use a library like 'pdf-parse' or 'textract' to extract text from PDFs or other document formats
    // For simplicity, let's assume the file is a text file, so we'll read its content
    return fs.readFileSync(filePath, 'utf-8');
}