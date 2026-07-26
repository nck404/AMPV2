const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

async function getFriendshipStatus(prisma, userAId, userBId) {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { user_id: userAId, friend_id: userBId },
                { user_id: userBId, friend_id: userAId }
            ]
        }
    });
    return friendship ? friendship.status : 'none';
}

function serializeUser(user) {
    return {
        id: user.id,
        username: user.username,
        public_id: user.public_id,
        avatar_url: user.avatar_url
    };
}

// GET /users/search
router.get('/users/search', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const query = req.query.q || '';

    if (!query) {
        return res.status(200).json([]);
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                id: { not: userId },
                OR: [
                    { username: { contains: query } },
                    { public_id: { contains: query } }
                ]
            },
            take: 10
        });

        const result = [];
        for (const u of users) {
            const status = await getFriendshipStatus(prisma, userId, u.id);
            const entry = serializeUser(u);
            entry.friend_status = status;
            result.push(entry);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /friends/request
router.post('/friends/request', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { friend_id } = req.body;

    if (!friend_id) return res.status(400).json({ msg: "Friend ID required" });
    if (userId === parseInt(friend_id)) return res.status(400).json({ msg: "Cannot add yourself" });

    try {
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { user_id: userId, friend_id: parseInt(friend_id) },
                    { user_id: parseInt(friend_id), friend_id: userId }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ msg: "Request already exists or already friends" });
        }

        await prisma.friendship.create({
            data: {
                user_id: userId,
                friend_id: parseInt(friend_id),
                status: 'pending'
            }
        });

        res.status(201).json({ msg: "Request sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /friends/accept
router.post('/friends/accept', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { request_id } = req.body;

    try {
        const friendship = await prisma.friendship.findUnique({ where: { id: parseInt(request_id) } });
        if (!friendship || friendship.friend_id !== userId) {
            return res.status(404).json({ msg: "Request not found" });
        }

        await prisma.friendship.update({
            where: { id: parseInt(request_id) },
            data: { status: 'accepted' }
        });

        res.status(200).json({ msg: "Request accepted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /friends
router.get('/friends', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { user_id: userId },
                    { friend_id: userId }
                ],
                status: 'accepted'
            },
            include: { user: true, friend: true }
        });

        const result = [];
        for (const f of friendships) {
            const friend = f.user_id === userId ? f.friend : f.user;
            const unread_count = await prisma.message.count({
                where: {
                    sender_id: friend.id,
                    receiver_id: userId,
                    is_read: false
                }
            });

            const entry = serializeUser(friend);
            entry.unread_count = unread_count;
            result.push(entry);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /friends/pending
router.get('/friends/pending', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        const requests = await prisma.friendship.findMany({
            where: { friend_id: userId, status: 'pending' },
            include: { user: true }
        });

        const result = requests.map(r => ({
            request_id: r.id,
            ...serializeUser(r.user)
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
