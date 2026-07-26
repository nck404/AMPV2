const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const total_users = await prisma.user.count();
        const total_businesses = await prisma.user.count({ where: { role: 'business' } });
        const total_posts = await prisma.post.count();
        const total_jobs = await prisma.job.count();

        res.status(200).json({
            total_users,
            total_businesses,
            total_posts,
            total_jobs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const users = await prisma.user.findMany();
        const output = users.map(user => ({
            id: user.id,
            name: user.username,
            username: user.username,
            email: user.email,
            public_id: user.public_id,
            role: user.role,
            is_admin: user.is_admin,
            status: user.is_banned ? "banned" : "active",
            created_at: user.created_at
        }));

        res.status(200).json({ users: output });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /users/:id/ban
router.put('/users/:id/ban', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.params.id);
    const { ban } = req.body;
    const ban_status = ban !== undefined ? ban : true;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ msg: "User not found" });

        await prisma.user.update({
            where: { id: userId },
            data: { is_banned: ban_status }
        });

        res.status(200).json({ msg: `User ${user.username} has been ${ban_status ? 'banned' : 'unbanned'}.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /users/:id/role
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!role) return res.status(400).json({ msg: "Missing role field." });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ msg: "User not found" });

        await prisma.user.update({
            where: { id: userId },
            data: {
                role: role,
                is_admin: role === 'admin'
            }
        });

        res.status(200).json({ msg: `User ${user.username} role updated to ${role}.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// DELETE /users/:id
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.params.id);

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ msg: "User not found" });

        await prisma.post.deleteMany({ where: { author_id: userId } });
        await prisma.user.delete({ where: { id: userId } });

        res.status(200).json({ msg: `User ${user.username} deleted.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /routes
router.get('/routes', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    try {
        const config = await prisma.systemConfig.findUnique({ where: { key: 'locked_routes' } });
        let locked_routes = [];
        if (config) {
            try {
                locked_routes = JSON.parse(config.value);
            } catch (e) {}
        }
        res.status(200).json({ locked_routes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /routes
router.post('/routes', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const { locked_routes } = req.body;

    if (!Array.isArray(locked_routes)) {
        return res.status(400).json({ msg: "locked_routes must be a list" });
    }

    try {
        const json_value = JSON.stringify(locked_routes);
        await prisma.systemConfig.upsert({
            where: { key: 'locked_routes' },
            update: { value: json_value },
            create: { key: 'locked_routes', value: json_value }
        });

        res.status(200).json({ msg: "Locked routes updated successfully.", locked_routes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /check-route
router.get('/check-route', async (req, res) => {
    const prisma = req.app.get('prisma');
    const path = req.query.path || "";

    try {
        const config = await prisma.systemConfig.findUnique({ where: { key: 'locked_routes' } });
        if (config) {
            try {
                const locked_routes = JSON.parse(config.value);
                if (locked_routes.includes(path)) {
                    return res.status(200).json({ locked: true });
                }
            } catch (e) {}
        }
        res.status(200).json({ locked: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /posts
router.get('/posts', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const posts = await prisma.post.findMany({ include: { author: true } });
        const output = posts.map(post => ({
            id: post.id,
            title: post.title,
            author: post.author.username,
            date: post.created_at.toISOString().split('T')[0]
        }));
        res.status(200).json({ posts: output });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// DELETE /posts/:id
router.delete('/posts/:id', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const postId = parseInt(req.params.id);

    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ msg: "Post not found" });

        await prisma.comment.deleteMany({ where: { post_id: postId } });
        await prisma.post.delete({ where: { id: postId } });

        res.status(200).json({ msg: "Post deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /jobs
router.get('/jobs', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const jobs = await prisma.job.findMany();
        const output = jobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            status: job.status
        }));
        res.status(200).json({ jobs: output });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// DELETE /jobs/:id
router.delete('/jobs/:id', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const jobId = parseInt(req.params.id);

    try {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ msg: "Job not found" });

        await prisma.job.delete({ where: { id: jobId } });
        res.status(200).json({ msg: "Job deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /jobs/:id/approve
router.put('/jobs/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const jobId = parseInt(req.params.id);

    try {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ msg: "Job not found" });

        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'approved' }
        });
        res.status(200).json({ msg: "Job approved" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /notifications
router.post('/notifications', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const { title, content, type, user_id } = req.body;

    if (!title || !content) {
        return res.status(400).json({ msg: "Title and content are required." });
    }

    try {
        await prisma.notification.create({
            data: {
                user_id: user_id || null,
                title,
                content,
                type: type || 'admin'
            }
        });
        res.status(201).json({ msg: "Notification sent successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /notifications
router.get('/notifications', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const notifs = await prisma.notification.findMany({
            orderBy: { created_at: 'desc' }
        });

        const output = notifs.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            type: n.type,
            user_id: n.user_id,
            created_at: n.created_at.toISOString()
        }));

        res.status(200).json({ notifications: output });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// DELETE /notifications/:id
router.delete('/notifications/:id', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const notifId = parseInt(req.params.id);

    try {
        const notif = await prisma.notification.findUnique({ where: { id: notifId } });
        if (!notif) return res.status(404).json({ msg: "Notification not found" });

        await prisma.notification.delete({ where: { id: notifId } });
        res.status(200).json({ msg: "Notification deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
