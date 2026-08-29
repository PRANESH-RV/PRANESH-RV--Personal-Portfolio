require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const adminEmail = process.env.ADMIN_EMAIL || 'praneshrv567@gmail.com';
const whatsappNumber = process.env.WHATSAPP_NUMBER || '919361066465';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, projectType, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and message are required.',
    });
  }

  const subject = `Project Inquiry - ${projectType || 'General'}`;
  const whatsappText = `Hi, my name is ${name}.\nEmail: ${email}\nProject Type: ${projectType || 'General'}\n\n${message}`;

  try {
    const emailConfigured = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

    if (!emailConfigured) {
      return res.status(200).json({
        success: true,
        emailSent: false,
        whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`,
        message: 'Email is not configured yet. WhatsApp link is ready.',
      });
    }

    await transporter.sendMail({
      from: `"${name}" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      replyTo: email,
      subject,
      html: `
        <h3>New Project Inquiry</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Project Type:</strong> ${projectType || 'General'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({
      success: true,
      emailSent: true,
      whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`,
      message: 'Message sent successfully.',
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      emailSent: false,
      whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`,
      error: 'Unable to send email right now. Please try again later or contact via WhatsApp.',
    });
  }
});
const portfolioDir = __dirname;
app.use(express.static(portfolioDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(portfolioDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Portfolio backend running at http://localhost:${PORT}`);
});
