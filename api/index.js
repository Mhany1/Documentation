const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());

// Projects
app.get(['/api/projects', '/projects'], async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post(['/api/projects', '/projects'], async (req, res) => {
    try {
        const name = (req.body.name || '').trim();
        if (!name) return res.status(400).send('Name is required');

        // Check if exists
        const { data: existing, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .ilike('name', name)
            .single();

        if (existing) return res.json(existing);

        const { data, error } = await supabase
            .from('projects')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: err.message });
    }
});

// Developers
app.get(['/api/developers', '/developers'], async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('developers')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error fetching developers:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post(['/api/developers', '/developers'], async (req, res) => {
    try {
        const name = (req.body.name || '').trim();
        if (!name) return res.status(400).send('Name is required');

        const { data: existing, error: fetchError } = await supabase
            .from('developers')
            .select('*')
            .ilike('name', name)
            .single();

        if (existing) return res.json(existing);

        const { data, error } = await supabase
            .from('developers')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error creating developer:', err);
        res.status(500).json({ error: err.message });
    }
});

// Documentation
app.get(['/api/documentation/:projectId/:developerId', '/documentation/:projectId/:developerId'], async (req, res) => {
    try {
        const { projectId, developerId } = req.params;
        const { data, error } = await supabase
            .from('documentation')
            .select('*')
            .eq('project_id', projectId)
            .eq('developer_id', developerId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
        res.json(data || {});
    } catch (err) {
        console.error('Error fetching documentation:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get(['/api/documentation', '/documentation'], async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documentation')
            .select('*');
        if (error) throw error;

        // Map back to camelCase for frontend compatibility if needed
        // but our table schema matches frontend fields mostly
        const mappedData = data.map(d => ({
            ...d,
            projectId: d.project_id,
            developerId: d.developer_id,
            projectName: d.project_name,
            developerName: d.developer_name
        }));
        res.json(mappedData);
    } catch (err) {
        console.error('Error fetching all documentation:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post(['/api/documentation', '/documentation'], async (req, res) => {
    try {
        const doc = req.body;
        if (!doc?.projectId || !doc?.developerId) {
            return res.status(400).send('Project ID and Developer ID are required');
        }

        const payload = {
            project_id: doc.projectId,
            developer_id: doc.developerId,
            project_name: doc.projectName,
            developer_name: doc.developerName,
            description: doc.description,
            purpose: doc.purpose,
            location: doc.location,
            dependencies: doc.dependencies,
            thoughts: doc.thoughts,
            challenges: doc.challenges,
            assumptions: doc.assumptions,
            approach: doc.approach,
            alternatives: doc.alternatives,
            solution: doc.solution,
            summary: doc.summary,
            architecture: doc.architecture,
            updated_at: new Date().toISOString()
        };

        let result;
        if (doc.id) {
            const { data, error } = await supabase
                .from('documentation')
                .update(payload)
                .eq('id', doc.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('documentation')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        res.json({
            ...result,
            projectId: result.project_id,
            developerId: result.developer_id,
            projectName: result.project_name,
            developerName: result.developer_name
        });
    } catch (err) {
        console.error('Error saving documentation:', err);
        res.status(500).json({ error: err.message });
    }
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

function generateProjectPdf(pdf, projectName, docs) {
    pdf.font('Helvetica-Bold').fontSize(28).fillColor('#000000').text(`${projectName} - Documentation`, { align: 'center' });
    pdf.moveDown(2);

    if (!docs || docs.length === 0) {
        pdf.font('Helvetica').fontSize(14).text('No documentation entries found.');
        return;
    }

    docs.forEach((item, i) => {
        if (i > 0) pdf.addPage();
        pdf.font('Helvetica-Bold').fontSize(22).fillColor('#000000').text(`Contributor: ${item.developer_name || 'Unknown'}`, { underline: true });
        pdf.moveDown(1.5);

        PDF_STRUCTURE.forEach(section => {
            pdf.font('Helvetica-Bold').fontSize(20).text(section.title, { underline: true });
            pdf.moveDown(1);

            Object.keys(section.fields).forEach(key => {
                pdf.font('Helvetica-Bold').fontSize(16).text(`${section.fields[key]}:`);
                const content = item[key] || '(No response provided)';
                pdf.font('Helvetica').fontSize(14).text(content);
                pdf.moveDown(1);
            });
            pdf.moveDown(1);
        });
    });
}

const handleSinglePdf = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { data: project } = await supabase.from('projects').select('name').eq('id', projectId).single();
        const { data: docs } = await supabase.from('documentation').select('*').eq('project_id', projectId);

        const projectName = project ? project.name : 'Project';
        const pdf = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${projectName.replace(/\s+/g, '_')}_Documentation.pdf"`);

        pdf.pipe(res);
        generateProjectPdf(pdf, projectName, docs || []);
        pdf.end();
    } catch (error) {
        console.error('PDF Error:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
};

const handleGlobalPdf = async (req, res) => {
    try {
        const { data: docs } = await supabase.from('documentation').select('*').order('project_name', { ascending: true });
        const pdf = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Full_System_Documentation.pdf"');

        pdf.pipe(res);
        pdf.font('Helvetica-Bold').fontSize(30).text('Full System Documentation', { align: 'center' });
        pdf.moveDown(2);

        const projectsMap = {};
        (docs || []).forEach(doc => {
            if (!projectsMap[doc.project_id]) projectsMap[doc.project_id] = { name: doc.project_name, docs: [] };
            projectsMap[doc.project_id].docs.push(doc);
        });

        Object.values(projectsMap).forEach((proj, idx) => {
            if (idx > 0) pdf.addPage();
            pdf.font('Helvetica-Bold').fontSize(26).text(`Project: ${proj.name}`, { underline: true });
            pdf.moveDown(1.5);

            proj.docs.forEach((item, docIdx) => {
                if (docIdx > 0) pdf.moveDown(2);
                pdf.font('Helvetica-Bold').fontSize(22).text(`Contributor: ${item.developer_name || 'Unknown'}`, { underline: true });
                pdf.moveDown(1);

                PDF_STRUCTURE.forEach(section => {
                    pdf.font('Helvetica-Bold').fontSize(20).text(section.title, { underline: true });
                    pdf.moveDown(1);
                    Object.keys(section.fields).forEach(key => {
                        pdf.font('Helvetica-Bold').fontSize(16).text(`${section.fields[key]}:`);
                        pdf.font('Helvetica').fontSize(14).text(item[key] || '(No data)');
                        pdf.moveDown(1);
                    });
                    pdf.moveDown(1);
                });
            });
        });

        pdf.end();
    } catch (error) {
        console.error('Global PDF Error:', error);
        res.status(500).send('Error generating global report');
    }
};

app.get(['/api/download-pdf/:projectId', '/download-pdf/:projectId'], handleSinglePdf);
app.get(['/api/download-all-projects', '/download-all-projects'], handleGlobalPdf);

// Compatibility POST routes if frontend still sends data
app.post(['/api/download-pdf/:projectId', '/download-pdf/:projectId'], handleSinglePdf);
app.post(['/api/download-all-projects', '/download-all-projects'], handleGlobalPdf);

app.use((req, res) => {
    res.status(404).json({ message: "API Route not found", path: req.path });
});

module.exports = app;

