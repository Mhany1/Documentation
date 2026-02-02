const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// In-memory data store (⚠️ resets on redeploy / cold start)
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

  docs.forEach((item, i) => {
    if (i > 0) pdf.addPage();
    pdf.fontSize(16).text(`Contributor: ${item.developerName || 'Unknown'}`, { underline: true });
    pdf.moveDown(1);
    pdf.fontSize(12).text(item.description || '-');
  });

  pdf.end();
});

// 🔥 THIS is the key for Vercel
module.exports = app;
