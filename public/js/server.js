// server.js
const express = require('express'); // Import the express module
const nodemailer = require('nodemailer'); // Import the nodemailer module
const cors = require('cors'); // Import the cors module
const app = express();
const port = 4000;
app.use(express.json()); // Middleware to handle JSON data
app.use(cors()); // Middleware to enable CORS for all routes

app.use(cors({
    origin: 'http://localhost:4000', // your frontend's origin
    methods: 'GET, POST',
    allowedHeaders: ['Content-Type']
}));
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});


app.post('/send-email', (req, res) => {
    console.log("Received email request:", req.body);
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'POST'); // Allow only POST method
    const { recipient, subject, html } = req.body; // Extract recipient directly from req.body
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'clubhub.salcc@gmail.com',
                pass: 'hiaq amrk giwp ynto'
            },
            tls: {
                rejectUnauthorized: false // Disable SSL verification
            }
        });
        const mailOptions = {
            from: 'Club Hub <clubhub.salcc@gmail.com>',
            to: recipient, // Use recipient directly from the request body
            subject: subject,
            html: html
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error occurred:', error);
                res.status(500).send('Internal Server Error: ' + error.message); // Send error message to client
            } else {
                console.log('Email sent:', info.response);
                res.send('Email sent successfully');
            }
        });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).send('Internal Server Error: ' + error.message); // Send error message to client
    }

});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});