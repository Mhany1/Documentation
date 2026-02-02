const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// In-memory data store (⚠️ resets on redeploy / cold start in Serverless environment)
// Note: For persistent data on Vercel, use a database (MongoDB, Postgres, etc.)
let projects = [];
let developers = [];
let documentationStore = [];

// Projects
app.get('/api/projects', (req, res) => {
    const sorted = [...projects].sort((a, b) => a.name.localeCompare(b.name));
    res.json(sorted);
});

app.post('/api/projects', (req, res) => {
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).send('Name is required');

    const existing = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existing) return res.json(existing);

    const newProject = {
        id: Date.now() + '-' + Math.floor(Math.random() * 100000),
        name
    };
    projects.push(newProject);
    res.json(newProject);
});

// Developers
app.get('/api/developers', (req, res) => {
    const sorted = [...developers].sort((a, b) => a.name.localeCompare(b.name));
    res.json(sorted);
});

app.post('/api/developers', (req, res) => {
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).send('Name is required');

    const existing = developers.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (existing) return res.json(existing);

    const newDeveloper = {
        id: Date.now() + '-' + Math.floor(Math.random() * 100000),
        name
    };
    developers.push(newDeveloper);
    res.json(newDeveloper);
});

// Documentation
app.get('/api/documentation/:projectId/:developerId', (req, res) => {
    const { projectId, developerId } = req.params;
    const doc = documentationStore.find(
        d => d.projectId === projectId && d.developerId === developerId
    );
    res.json(doc || {});
});

app.post('/api/documentation', (req, res) => {
    const doc = req.body;
    if (!doc?.projectId || !doc?.developerId) {
        return res.status(400).send('Project ID and Developer ID are required');
    }

    const newDoc = {
        ...doc,
        id: Date.now() + '-' + Math.floor(Math.random() * 100000),
        createdAt: new Date().toISOString()
    };
    documentationStore.push(newDoc);
    res.json(newDoc);
});

// PDF
app.get('/api/download-pdf/:projectId', (req, res) => {
    const project = projects.find(p => p.id === req.params.projectId);
    if (!project) return res.status(404).send('Project not found');

    const docs = documentationStore.filter(d => d.projectId === project.id);

    const pdf = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${project.name}_Documentation.pdf"`
    );

    pdf.pipe(res);

    pdf.fontSize(22).text(`${project.name} - Documentation`, { align: 'center' });
    pdf.moveDown(2);

    if (docs.length === 0) {
        pdf.fontSize(12).text('No documentation available for this project.', { align: 'center' });
    } else {
        docs.forEach((item, i) => {
            if (i > 0) pdf.addPage();

            const devName = item.developerName || 'Unknown Developer';

            pdf.fontSize(16).text(`Contributor: ${devName}`, { underline: true });
            pdf.moveDown(1);

            // Helper function for sections
            const addSection = (title, content) => {
                pdf.fontSize(14).text(title);
                pdf.moveDown(0.5);
                pdf.fontSize(11).text(content || '-', { align: 'left' });
                pdf.moveDown(1);
            };

            // We need to restore the detailed PDF generation logic from server.js
            // (The previous diff view showed some truncation/simplification, so I'll be thorough based on standard fields)
            // Wait, looking at the previous diff in step 135, the user simplified it a lot?
            // No, Step 135 was "The following changes were made by the USER".
            // The user simplified the PDF generation in Step 135 significantly?
            // Let me re-read Step 135 carefully.
            // Ah, the diff in 135 shows the USER modified server.js to simplify it?
            // "app.get('/api/download-pdf/:projectId'..." was modified. 
            // The user code in Step 135 has:
            // pdf.fontSize(22).text(`${project.name} - Documentation`, { align: 'center' });
            // pdf.moveDown(2);
            // docs.forEach((item, i) => {
            //   if (i > 0) pdf.addPage();
            //   pdf.fontSize(16).text(`Contributor: ${item.developerName || 'Unknown'}`, { underline: true });
            //   pdf.moveDown(1);
            //   pdf.fontSize(12).text(item.description || '-');
            // });
            // pdf.end();

            // OKAY. I will follow the USER'S latest code from Step 135 for the PDF generation to be safe.
            // I will implement exactly what is in the "after" block of Step 135.

            pdf.fontSize(12).text(item.description || '-');
        });
    }

    pdf.end();
});

// Export the app for Vercel
module.exports = app;
