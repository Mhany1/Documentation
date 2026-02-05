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
app.get(['/api/projects', '/projects'], (req, res) => {
    const sorted = [...projects].sort((a, b) => a.name.localeCompare(b.name));
    res.json(sorted);
});

app.post(['/api/projects', '/projects'], (req, res) => {
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
app.get(['/api/developers', '/developers'], (req, res) => {
    const sorted = [...developers].sort((a, b) => a.name.localeCompare(b.name));
    res.json(sorted);
});

app.post(['/api/developers', '/developers'], (req, res) => {
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
app.get(['/api/documentation/:projectId/:developerId', '/documentation/:projectId/:developerId'], (req, res) => {
    const { projectId, developerId } = req.params;
    const doc = documentationStore.find(
        d => d.projectId === projectId && d.developerId === developerId
    );
    res.json(doc || {});
});

app.post(['/api/documentation', '/documentation'], (req, res) => {
    const doc = req.body;
    if (!doc?.projectId || !doc?.developerId) {
        return res.status(400).send('Project ID and Developer ID are required');
    }

    // Prevents duplication: Find existing and update, or push new
    // Identify by unique ID if provided, OR by the combination of projectId and developerId
    const existingIndex = documentationStore.findIndex(d =>
        (doc.id && d.id === doc.id) ||
        (!doc.id && d.projectId === doc.projectId && d.developerId === doc.developerId)
    );

    const updatedDoc = {
        ...doc,
        updatedAt: new Date().toISOString(),
        id: (existingIndex !== -1) ? documentationStore[existingIndex].id : (doc.id || (Date.now() + '-' + Math.floor(Math.random() * 100000)))
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
    const reportTitle = project.name || 'Project Documentation';
    pdf.font('Helvetica-Bold').fontSize(28).fillColor('#000000').text(`${reportTitle} - Documentation`, { align: 'center' });
    pdf.moveDown(2);

    if (!docs || docs.length === 0) {
        pdf.font('Helvetica').fontSize(14).text('No documentation entries found. Please ensure you saved your work before downloading.');
        return;
    }

    docs.forEach((item, i) => {
        if (i > 0) pdf.addPage();

        // 1. Contributor (Bold & Underlined)
        const devName = item.developerName || 'Unknown Contributor';
        pdf.font('Helvetica-Bold').fontSize(22).fillColor('#000000').text(`Contributor: ${devName}`, { underline: true });
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
                // Even if answer is empty, show something so the user knows it's working
                const content = answerText.trim() ? answerText : '(No response provided for this field)';
                pdf.font('Helvetica').fontSize(14).text(content);
                pdf.moveDown(1);
            });

            pdf.moveDown(1); // Gap between sections
        });
    });
}

// PDF - Single Project (Supports GET for basic and POST for full sync)
const handleSinglePdf = (req, res) => {
    try {
        const projectId = req.params.projectId;
        // Data can come from body (POST) or store (GET)
        const incomingDocs = req.body && Array.isArray(req.body) ? req.body : [];

        // Merge incoming docs with current store (favoring incoming)
        let docs = [...documentationStore.filter(d => d.projectId === projectId)];
        incomingDocs.forEach(idoc => {
            const idx = docs.findIndex(d => d.id === idoc.id);
            if (idx !== -1) docs[idx] = idoc;
            else if (idoc.projectId === projectId) docs.push(idoc);
        });

        // Recover project name
        let projectName = 'Project Documentation';
        const projectInList = projects.find(p => p.id === projectId);
        if (projectInList) {
            projectName = projectInList.name;
        } else if (docs.length > 0) {
            projectName = docs[0].projectName || 'Project Documentation';
        }

        const project = { id: projectId, name: projectName };

        const pdf = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${projectName.replace(/\s+/g, '_')}_Documentation.pdf"`
        );

        pdf.pipe(res);
        generateProjectPdf(pdf, project, docs);
        pdf.end();
    } catch (error) {
        console.error('PDF Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error generating PDF', details: error.message });
        }
    }
};

app.get(['/api/download-pdf/:projectId', '/download-pdf/:projectId'], handleSinglePdf);
app.post(['/api/download-pdf/:projectId', '/download-pdf/:projectId'], handleSinglePdf);

// PDF - All Projects Global Report (Supports POST for full sync)
const handleGlobalPdf = (req, res) => {
    try {
        const pdf = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="Full_System_Documentation.pdf"'
        );

        const incomingDocs = req.body && Array.isArray(req.body) ? req.body : [];

        // Merge strategy: Start with store, then overwrite/add from incoming
        let allDocs = [...documentationStore];
        incomingDocs.forEach(idoc => {
            const idx = allDocs.findIndex(d => d.id === idoc.id);
            if (idx !== -1) allDocs[idx] = idoc;
            else allDocs.push(idoc);
        });

        pdf.pipe(res);
        pdf.font('Helvetica-Bold').fontSize(30).text('Full System Documentation', { align: 'center' });
        pdf.moveDown(2);

        // Discovery: Get all project names from our merged documentation
        const projectMap = new Map();
        // 1. Fill from global projects array (if it has names)
        projects.forEach(p => projectMap.set(p.id, p.name));
        // 2. Supplement from documentation (for Vercel resets)
        allDocs.forEach(d => {
            if (!projectMap.has(d.projectId)) {
                projectMap.set(d.projectId, d.projectName || 'Active Project');
            }
        });

        if (allDocs.length === 0) {
            pdf.font('Helvetica').fontSize(16).text('No projects or documentation found in the system.');
        } else {
            const uniqueProjectIds = Array.from(projectMap.keys());
            uniqueProjectIds.forEach((pid, index) => {
                const pname = projectMap.get(pid);
                const projectDocs = allDocs.filter(d => d.projectId === pid);

                if (projectDocs.length === 0) return; // Skip if no docs found for this discovered project

                if (index > 0) pdf.addPage();

                pdf.font('Helvetica-Bold').fontSize(26).text(`Project: ${pname}`, { underline: true });
                pdf.moveDown(1.5);

                // Group by developer to ensure unique entries
                projectDocs.forEach((item, docIndex) => {
                    if (docIndex > 0) pdf.moveDown(2);

                    pdf.font('Helvetica-Bold').fontSize(22).text(`Contributor: ${item.developerName || 'Unknown'}`, { underline: true });
                    pdf.fillColor('#000000'); // Reset color
                    pdf.moveDown(1);

                    PDF_STRUCTURE.forEach(section => {
                        pdf.font('Helvetica-Bold').fontSize(20).text(section.title, { underline: true });
                        pdf.moveDown(1);

                        Object.keys(section.fields).forEach(key => {
                            const label = section.fields[key];
                            const answer = item[key] || '';
                            pdf.font('Helvetica-Bold').fontSize(16).text(`${label}:`);
                            pdf.font('Helvetica').fontSize(14).text(answer || '(No data)');
                            pdf.moveDown(1);
                        });
                        pdf.moveDown(1);
                    });
                });
            });
        }

        pdf.end();
    } catch (error) {
        console.error('Global PDF Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Error generating global report');
        }
    }
};

app.get(['/api/download-all-projects', '/download-all-projects'], handleGlobalPdf);
app.post(['/api/download-all-projects', '/download-all-projects'], handleGlobalPdf);

// Debug Catch-all for API
app.use((req, res) => {
    console.log(`[API 404] ${req.method} ${req.path}`);
    res.status(404).json({
        message: "API Route not found",
        receivedPath: req.path,
        method: req.method
    });
});

module.exports = app;
