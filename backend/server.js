require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  category: String,
  sold: Boolean,
  dateOfSale: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

app.get("/api/init", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    await Transaction.deleteMany({});
    await Transaction.insertMany(response.data);
    res.send("Database initialized with transaction data.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/generate-pdf", async (req, res) => {
  try {
    const doc = new PDFDocument();
    const filePath = "transactions_report.pdf";
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("Transactions Report", { align: "center" });

    const transactions = await Transaction.find().limit(10);
    transactions.forEach((t, index) => {
      doc
        .fontSize(14)
        .text(`${index + 1}. ${t.title} - ${t.description} - $${t.price}`);
    });

    doc.end();

    stream.on("finish", () => {
      res.download(filePath);
    });
  } catch (error) {
    res.status(500).send("Error generating PDF");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
