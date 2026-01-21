// BACKEND SERVER.JS
// Copy this into: backend/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ensure upload directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Data directories
const dataDir = 'data';
const contactsDir = path.join(dataDir, 'contacts');
const invoicesDir = path.join(dataDir, 'invoices');
const quotesDir = path.join(dataDir, 'quotes');

[contactsDir, invoicesDir, quotesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// ===== API ROUTES =====

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Get all contacts
app.get('/api/contacts', (req, res) => {
  try {
    const files = fs.readdirSync(contactsDir);
    const contacts = files.map(file => {
      const data = fs.readFileSync(path.join(contactsDir, file), 'utf8');
      return JSON.parse(data);
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new contact
app.post('/api/contacts', (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    
    const contact = {
      id: Date.now(),
      name,
      email,
      phone,
      service,
      message,
      createdAt: new Date()
    };
    
    const filename = path.join(contactsDir, `${contact.id}.json`);
    fs.writeFileSync(filename, JSON.stringify(contact, null, 2));
    
    // Send email to company
    transporter.sendMail({
      to: process.env.COMPANY_EMAIL,
      subject: `New contact from ${name}`,
      text: `Service: ${service}\nPhone: ${phone}\nMessage: ${message}`
    });
    
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate quote
app.post('/api/quotes/generate', (req, res) => {
  try {
    const { customerName, items, total } = req.body;
    
    const doc = new PDFDocument();
    const filename = path.join(quotesDir, `quote-${Date.now()}.pdf`);
    
    doc.pipe(fs.createWriteStream(filename));
    
    doc.fontSize(20).text('QUOTE', 100, 100);
    doc.fontSize(12).text(`Customer: ${customerName}`, 100, 150);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 100, 170);
    
    doc.moveTo(100, 200).lineTo(500, 200).stroke();
    
    items.forEach((item, i) => {
      const y = 220 + (i * 30);
      doc.text(`${item.description}: $${item.price}`, 100, y);
    });
    
    doc.moveTo(100, 220 + (items.length * 30) + 20).lineTo(500, 220 + (items.length * 30) + 20).stroke();
    doc.fontSize(14).text(`TOTAL: $${total}`, 100, 220 + (items.length * 30) + 40);
    
    doc.end();
    
    res.json({ success: true, filename: path.basename(filename) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate invoice
app.post('/api/invoices/generate', (req, res) => {
  try {
    const { customerName, items, total } = req.body;
    
    const doc = new PDFDocument();
    const filename = path.join(invoicesDir, `invoice-${Date.now()}.pdf`);
    
    doc.pipe(fs.createWriteStream(filename));
    
    doc.fontSize(20).text('INVOICE', 100, 100);
    doc.fontSize(12).text(`Customer: ${customerName}`, 100, 150);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 100, 170);
    doc.text(`Due Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 100, 190);
    
    doc.moveTo(100, 220).lineTo(500, 220).stroke();
    
    items.forEach((item, i) => {
      const y = 240 + (i * 30);
      doc.text(`${item.description}: $${item.price}`, 100, y);
    });
    
    doc.moveTo(100, 240 + (items.length * 30) + 20).lineTo(500, 240 + (items.length * 30) + 20).stroke();
    doc.fontSize(14).text(`TOTAL DUE: $${total}`, 100, 240 + (items.length * 30) + 40);
    
    doc.end();
    
    res.json({ success: true, filename: path.basename(filename) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download file
app.get('/api/download/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const filepath = path.join(type === 'quote' ? quotesDir : invoicesDir, filename);
    res.download(filepath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Email document
app.post('/api/email-document', (req, res) => {
  try {
    const { recipientEmail, subject, filename } = req.body;
    
    transporter.sendMail({
      to: recipientEmail,
      subject: subject,
      text: 'Please see attached document',
      attachments: [{
        path: path.join(quotesDir, filename)
      }]
    });
    
    res.json({ success: true, message: 'Email sent!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Self-assessment quiz submission
app.post('/api/assessment', (req, res) => {
  try {
    const { name, email, answers, service } = req.body;
    
    const assessment = {
      id: Date.now(),
      name,
      email,
      service,
      answers,
      submittedAt: new Date()
    };
    
    // Send results to company
    transporter.sendMail({
      to: process.env.COMPANY_EMAIL,
      subject: `Self-Assessment Submitted: ${name}`,
      text: `Customer: ${name}\nService: ${service}\nEmail: ${email}\n\nAnswers: ${JSON.stringify(answers, null, 2)}`
    });
    
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📧 Email: ${process.env.SMTP_USER}`);
  console.log(`🏢 Company: ${process.env.COMPANY_NAME}`);
});
