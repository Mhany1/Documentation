const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory data store
let projects = [];
let developers = [];
let documentationStore = [];

// Projects Endpoints
app.get('/api/projects', (req, res) => {
  const sorted = [...projects].sort((a, b) => a.name.localeCompare(b.name));
  res.json(sorted);
});

app.post('/api/projects', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).send('Name is required');
  }

  const existing = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return res.json(existing);
  }

  const newProject = {
    id: String(Date.now()) + '-' + String(Math.floor(Math.random() * 100000)),
    name: name
  };
  projects.push(newProject);
  res.json(newProject);
});

// Developers Endpoints
app.get('/api/developers', (req, res) => {
  const sorted = [...developers].sort((a, b) => a.name.localeCompare(b.name));
  res.json(sorted);
});

app.post('/api/developers', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).send('Name is required');
  }

  const existing = developers.find(d => d.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return res.json(existing);
  }

  const newDeveloper = {
    id: String(Date.now()) + '-' + String(Math.floor(Math.random() * 100000)),
    name: name
  };
  developers.push(newDeveloper);
  res.json(newDeveloper);
});

// Documentation Endpoints
app.get('/api/documentation/:projectId/:developerId', (req, res) => {
  const { projectId, developerId } = req.params;
  const doc = documentationStore.find(d => d.projectId === projectId && d.developerId === developerId);
  if (doc) {
    res.json(doc);
  } else {
    res.status(404).json({});
  }
});

app.post('/api/documentation', (req, res) => {
  const doc = req.body;
  if (!doc || !doc.projectId || !doc.developerId) {
    return res.status(400).send('Documentation data, Project ID, and Developer ID are required');
  }

  // Always create a new entry (no update/replace)
  const newDoc = {
    ...doc,
    id: String(Date.now()) + '-' + String(Math.floor(Math.random() * 100000)),
    createdAt: new Date().toISOString()
  };
  documentationStore.push(newDoc);
  res.json(newDoc);
});

// PDF Download Endpoint
app.get('/api/download-pdf/:projectId', (req, res) => {
  const { projectId } = req.params;

  // Find project
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  // Get all documentation for this project
  const docs = documentationStore.filter(d => d.projectId === projectId);

  // Create PDF
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${project.name}_Documentation.pdf"`);

  // Pipe PDF to response
  doc.pipe(res);

  // Add title
  doc.fontSize(24).font('Helvetica-Bold').text(`${project.name} - Documentation`, { align: 'center' });
  doc.moveDown(2);

  if (docs.length === 0) {
    doc.fontSize(12).font('Helvetica').text('No documentation available for this project.', { align: 'center' });
  } else {
    // Add each contributor's documentation
    docs.forEach((item, index) => {
      if (index > 0) {
        doc.addPage();
      }

      const devName = item.developerName || 'Unknown Developer';

      // Contributor header
      doc.fontSize(18).font('Helvetica-Bold').text(`Contributor: ${devName}`, { underline: true });
      doc.moveDown(1);

      // Helper function to add sections
      const addSection = (title, content) => {
        doc.fontSize(14).font('Helvetica-Bold').text(title);
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(content || '-', { align: 'left' });
        doc.moveDown(1);
      };

      // Basic Information
      doc.fontSize(16).font('Helvetica-Bold').text('Basic Information', { underline: true });
      doc.moveDown(0.5);
      addSection('Description:', item.description);
      addSection('Purpose:', item.purpose);
      addSection('Location:', item.location);
      addSection('Dependencies:', item.dependencies);

      // Development Process
      doc.fontSize(16).font('Helvetica-Bold').text('Development Process', { underline: true });
      doc.moveDown(0.5);
      addSection('Thoughts:', item.thoughts);
      addSection('Challenges Faced:', item.challenges);
      addSection('Assumptions Made:', item.assumptions);
      addSection('Why This Approach:', item.approach);
      addSection('Possible Alternatives:', item.alternatives);

      // Technical Details
      doc.fontSize(16).font('Helvetica-Bold').text('Technical Details', { underline: true });
      doc.moveDown(0.5);
      addSection('Solution:', item.solution);
      addSection('Summary:', item.summary);
      addSection('Architecture Notes:', item.architecture);
    });
  }

  // Finalize PDF
  doc.end();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
