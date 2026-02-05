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
  const docs = documentationStore.filter(
    d => d.projectId === projectId && d.developerId === developerId
  );
  res.json(docs);
});

app.post('/api/documentation', (req, res) => {
  const doc = req.body;
  if (!doc?.projectId || !doc?.developerId) {
    return res.status(400).send('Project ID and Developer ID are required');
  }

  // Identify by unique ID if provided, otherwise it's a new entry
  const existingIndex = doc.id ? documentationStore.findIndex(d => d.id === doc.id) : -1;

  const updatedDoc = {
    ...doc,
    updatedAt: new Date().toISOString(),
    id: (existingIndex !== -1) ? documentationStore[existingIndex].id : (doc.id || (Date.now() + '-' + Math.floor(Math.random() * 100000))),
    createdAt: (existingIndex !== -1) ? documentationStore[existingIndex].createdAt : new Date().toISOString()
  };

  if (existingIndex !== -1) {
    documentationStore[existingIndex] = updatedDoc;
  } else {
    documentationStore.push(updatedDoc);
  }

  res.json(updatedDoc);
});

// Section Definitions for PDF
const PDF_STRUCTURE = [
  {
    title: 'Basic Information',
    fields: {
      description: 'Description',
      purpose: 'Purpose',
      location: 'Location',
      dependencies: 'Dependencies'
    }
  },
  {
    title: 'Development Process',
    fields: {
      thoughts: 'Thoughts',
      challenges: 'Challenges Faced',
      assumptions: 'Assumptions Made',
      approach: 'Why This Approach',
      alternatives: 'Possible Alternatives'
    }
  },
  {
    title: 'Technical Details',
    fields: {
      solution: 'Solution',
      summary: 'Summary',
      architecture: 'Architecture Notes'
    }
  }
];

function generateProjectPdf(pdf, project, docs) {
  // Main Title (Top of page, centered)
  pdf.font('Helvetica-Bold').fontSize(28).fillColor('#000000').text(`${project.name} - Documentation`, { align: 'right' });
  pdf.moveDown(2);

  if (docs.length === 0) {
    pdf.font('Helvetica').fontSize(14).text('No documentation entries found for this project.');
    return;
  }

  docs.forEach((item, i) => {
    if (i > 0) pdf.addPage();

    // 1. Contributor (Bold & Underlined)
    const devName = item.developerName || 'Unknown';
    const dateStr = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : (item.createdAt ? new Date(item.createdAt).toLocaleString() : '');
    pdf.font('Helvetica-Bold').fontSize(22).fillColor('#000000').text(`Contributor: ${devName}`, { underline: true });
    if (dateStr) {
      pdf.font('Helvetica').fontSize(12).fillColor('#666666').text(`Date: ${dateStr}`);
    }
    pdf.moveDown(1.5);

    // Render Each Section from the Structure
    PDF_STRUCTURE.forEach(section => {
      // 2. Section Title (e.g., Basic Information) - Bold & Underlined
      pdf.font('Helvetica-Bold').fontSize(20).text(section.title, { underline: true });
      pdf.moveDown(1);

      Object.keys(section.fields).forEach(key => {
        const labelText = section.fields[key];
        const answerText = item[key] || '';

        // 3. Label (e.g., Description:) - Bold
        pdf.font('Helvetica-Bold').fontSize(16).text(`${labelText}:`);

        // 4. Content (Below Label) - Regular
        pdf.font('Helvetica').fontSize(14).text(answerText || 'No data entered');
        pdf.moveDown(1);
      });

      pdf.moveDown(1); // Gap between sections
    });
  });
}

// PDF - Single Project
app.get('/api/download-pdf/:projectId', (req, res) => {
  try {
    const project = projects.find(p => p.id === req.params.projectId);
    if (!project) return res.status(404).send('Project not found');

    const docs = documentationStore.filter(d => d.projectId === project.id);

    const pdf = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${project.name.replace(/\s+/g, '_')}_Documentation.pdf"`
    );

    pdf.pipe(res);
    generateProjectPdf(pdf, project, docs);
    pdf.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).send('Error generating PDF');
    }
  }
});

// PDF - All Projects Global Report
app.get('/api/download-all-projects', (req, res) => {
  try {
    const pdf = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Full_System_Documentation.pdf"'
    );

    pdf.pipe(res);
    pdf.font('Helvetica-Bold').fontSize(30).text('Full System Documentation', { align: 'center' });
    pdf.moveDown(2);

    if (projects.length === 0) {
      pdf.font('Helvetica').fontSize(16).text('No projects found in the system.');
    } else {
      projects.forEach((project, index) => {
        if (index > 0) pdf.addPage();

        const projectDocs = documentationStore.filter(d => d.projectId === project.id);

        pdf.font('Helvetica-Bold').fontSize(26).text(`Project: ${project.name}`, { underline: true });
        pdf.moveDown(1.5);

        if (projectDocs.length === 0) {
          pdf.font('Helvetica').fontSize(14).text('No documentation entries available.');
        } else {
          // Inner items
          projectDocs.forEach(item => {
            const dateStr = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : (item.createdAt ? new Date(item.createdAt).toLocaleString() : '');
            pdf.font('Helvetica-Bold').fontSize(22).text(`Contributor: ${item.developerName || 'Unknown'}`, { underline: true });
            if (dateStr) {
              pdf.font('Helvetica').fontSize(12).fillColor('#666666').text(`Date: ${dateStr}`);
            }
            pdf.fillColor('#000000');
            pdf.moveDown(1);

            PDF_STRUCTURE.forEach(section => {
              pdf.font('Helvetica-Bold').fontSize(20).text(section.title, { underline: true });
              pdf.moveDown(1);

              Object.keys(section.fields).forEach(key => {
                const label = section.fields[key];
                const answer = item[key] || '';
                pdf.font('Helvetica-Bold').fontSize(16).text(`${label}:`);
                pdf.font('Helvetica').fontSize(14).text(answer || 'N/A');
                pdf.moveDown(1);
              });
              pdf.moveDown(1);
            });
          });
        }
      });
    }

    pdf.end();
  } catch (error) {
    console.error('Global PDF Error:', error);
    if (!res.headersSent) {
      res.status(500).send('Error generating global report');
    }
  }
});

// For standalone deployment (Render/Railway/Render)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
