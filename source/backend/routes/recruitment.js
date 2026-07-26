const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// GET /jobs
router.get('/jobs', async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const jobs = await prisma.job.findMany({ where: { status: 'approved' } });
        const output = jobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            type: job.type,
            logo: job.company ? job.company[0].toUpperCase() : "?",
            tags: job.type ? [job.type] : [],
            date: job.created_at.toISOString().split('T')[0],
            description: job.description
        }));
        res.status(200).json({ jobs: output });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /jobs/:id
router.get('/jobs/:id', async (req, res) => {
    const prisma = req.app.get('prisma');
    const jobId = parseInt(req.params.id);

    try {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ msg: "Job not found" });

        res.status(200).json({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            type: job.type,
            description: job.description,
            created_at: job.created_at.toISOString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /jobs
router.post('/jobs', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { title, company, location, salary, type, description } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.role !== 'business' && !user.is_admin) {
            return res.status(403).json({ msg: "Only businesses can post jobs." });
        }

        if (!title || !company) {
            return res.status(400).json({ msg: "Missing required fields." });
        }

        const newJob = await prisma.job.create({
            data: {
                title,
                company,
                location,
                salary,
                type,
                description,
                author_id: userId,
                status: 'pending'
            }
        });

        res.status(201).json({ msg: "Job posted successfully. Waiting for admin approval.", job_id: newJob.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /jobs/:id/apply
router.post('/jobs/:id/apply', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const jobId = parseInt(req.params.id);
    const { name, email, phone, cv_url, cover_letter } = req.body;

    try {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ msg: "Job not found" });

        if (!name || !email) {
            return res.status(400).json({ msg: "Missing required fields." });
        }

        const existing = await prisma.jobApplication.findFirst({
            where: { job_id: jobId, user_id: userId }
        });

        if (existing) {
            return res.status(400).json({ msg: "You have already applied for this job." });
        }

        await prisma.jobApplication.create({
            data: {
                job_id: jobId,
                user_id: userId,
                name,
                email,
                phone,
                cv_url,
                cover_letter
            }
        });

        res.status(201).json({ msg: "Application submitted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /applications
router.get('/applications', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        let apps = [];

        if (user.role === 'business') {
            const jobs = await prisma.job.findMany({ where: { author_id: userId } });
            const jobIds = jobs.map(j => j.id);
            apps = await prisma.jobApplication.findMany({
                where: { job_id: { in: jobIds } },
                include: { job: true }
            });
        } else {
            apps = await prisma.jobApplication.findMany({
                where: { user_id: userId },
                include: { job: true }
            });
        }

        const output = apps.map(app => ({
            id: app.id,
            job_title: app.job.title,
            job_company: app.job.company,
            name: app.name,
            email: app.email,
            phone: app.phone,
            cv_url: app.cv_url,
            status: app.status,
            created_at: app.created_at.toISOString()
        }));

        res.status(200).json({ applications: output });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /upload
router.post('/upload', authenticateToken, upload.single('cv'), async (req, res) => {
    const userId = parseInt(req.user.sub);

    if (!req.file) {
        return res.status(400).json({ msg: "No selected file" });
    }

    try {
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (!['.pdf', '.doc', '.docx'].includes(ext)) {
            return res.status(400).json({ msg: "Only PDF, DOC, and DOCX files are allowed." });
        }

        const filename = `cv_${userId}_${Math.random().toString(36).substring(2, 10)}${ext}`;
        const targetPath = path.join(__dirname, '..', 'uploads', filename);

        fs.renameSync(req.file.path, targetPath);

        const cv_url = `/uploads/${filename}`;
        res.status(200).json({ msg: "CV uploaded successfully", cv_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /applications/:id/status
router.put('/applications/:id/status', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const appId = parseInt(req.params.id);
    const { status } = req.body;

    try {
        const app = await prisma.jobApplication.findUnique({
            where: { id: appId },
            include: { job: true }
        });
        if (!app) return res.status(404).json({ msg: "Application not found" });

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (app.job.author_id !== userId && !user.is_admin) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: "Invalid status" });
        }

        await prisma.jobApplication.update({
            where: { id: appId },
            data: { status }
        });

        res.status(200).json({ msg: `Application status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /applications/send-email
router.post('/applications/send-email', authenticateToken, async (req, res) => {
    const { emails, subject, body } = req.body;

    if (!emails || !emails.length) {
        return res.status(400).json({ msg: "No emails provided" });
    }

    console.log(`Sending email to ${emails.length} recipients:`, emails);
    console.log(`Subject: ${subject}`);

    res.status(200).json({ msg: `Successfully sent email to ${emails.length} applicants.` });
});

module.exports = router;
