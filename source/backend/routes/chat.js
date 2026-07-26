const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// GET /history
router.get('/history', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const receiverIdStr = req.query.receiver_id;

    try {
        let messages;
        if (receiverIdStr) {
            const receiverId = parseInt(receiverIdStr);
            messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { sender_id: userId, receiver_id: receiverId },
                        { sender_id: receiverId, receiver_id: userId }
                    ]
                },
                orderBy: { created_at: 'asc' },
                take: 100,
                include: { sender: true }
            });
        } else {
            messages = await prisma.message.findMany({
                where: { receiver_id: null },
                orderBy: { created_at: 'asc' },
                take: 100,
                include: { sender: true }
            });
        }

        const result = messages.map(msg => ({
            id: msg.id,
            sender_id: msg.sender_id,
            sender_name: msg.sender ? msg.sender.username : "Unknown",
            sender_is_admin: msg.sender ? msg.sender.is_admin : false,
            content: msg.content,
            timestamp: msg.created_at.toISOString()
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /unread-count
router.get('/unread-count', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        const count = await prisma.message.count({
            where: { receiver_id: userId, is_read: false }
        });
        res.status(200).json({ unread_count: count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /mark-read
router.post('/mark-read', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { sender_id } = req.body;

    if (!sender_id) return res.status(400).json({ msg: "sender_id is required" });

    try {
        await prisma.message.updateMany({
            where: { receiver_id: userId, sender_id: parseInt(sender_id), is_read: false },
            data: { is_read: true }
        });
        res.status(200).json({ msg: "Messages marked as read" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
