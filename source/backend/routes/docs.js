const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /
router.get('/', async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const docs = await prisma.documentation.findMany({
            orderBy: [
                { category: 'asc' },
                { order: 'asc' }
            ]
        });

        const result = docs.map(doc => ({
            id: doc.id,
            title: doc.title,
            slug: doc.slug,
            category: doc.category,
            order: doc.order
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /:slug
router.get('/:slug', async (req, res) => {
    const prisma = req.app.get('prisma');
    const { slug } = req.params;

    try {
        const doc = await prisma.documentation.findUnique({ where: { slug } });
        if (!doc) return res.status(404).json({ msg: "Documentation not found" });

        res.status(200).json({
            id: doc.id,
            title: doc.title,
            slug: doc.slug,
            category: doc.category,
            content: doc.content,
            order: doc.order,
            last_updated: doc.last_updated
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const { title, slug, content, category, order } = req.body;

    if (!title || !slug || !content) {
        return res.status(400).json({ msg: "Missing required fields" });
    }

    try {
        const existing = await prisma.documentation.findUnique({ where: { slug } });
        if (existing) return res.status(400).json({ msg: "Slug already exists" });

        const newDoc = await prisma.documentation.create({
            data: {
                title,
                slug,
                content,
                category: category || 'Hướng dẫn',
                order: order || 0
            }
        });

        res.status(201).json({ msg: "Documentation created successfully", id: newDoc.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /:id
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const docId = parseInt(req.params.id);
    const { title, slug, content, category, order } = req.body;

    try {
        const doc = await prisma.documentation.findUnique({ where: { id: docId } });
        if (!doc) return res.status(404).json({ msg: "Documentation not found" });

        if (slug && slug !== doc.slug) {
            const existing = await prisma.documentation.findUnique({ where: { slug } });
            if (existing) return res.status(400).json({ msg: "Slug already exists" });
        }

        await prisma.documentation.update({
            where: { id: docId },
            data: {
                title: title !== undefined ? title : doc.title,
                slug: slug !== undefined ? slug : doc.slug,
                content: content !== undefined ? content : doc.content,
                category: category !== undefined ? category : doc.category,
                order: order !== undefined ? order : doc.order
            }
        });

        res.status(200).json({ msg: "Documentation updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// DELETE /:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const docId = parseInt(req.params.id);

    try {
        const doc = await prisma.documentation.findUnique({ where: { id: docId } });
        if (!doc) return res.status(404).json({ msg: "Documentation not found" });

        await prisma.documentation.delete({ where: { id: docId } });
        res.status(200).json({ msg: "Documentation deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
