const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

function leaderboardEntryToDict(entry, user) {
    return {
        rank: entry.rank,
        user_id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        total_score: entry.total_score,
        total_lessons_completed: entry.total_lessons_completed,
        current_streak: entry.current_streak,
        highest_streak: entry.highest_streak,
        average_accuracy: entry.average_accuracy,
        total_practice_score: entry.total_practice_score,
        last_updated: entry.last_updated ? entry.last_updated.toISOString() : null
    };
}

async function updateLeaderboard(prisma, userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const progressRecords = await prisma.learningProgress.findMany({ where: { user_id: userId } });

    const total_score = progressRecords.reduce((sum, p) => sum + p.score, 0);
    const total_lessons = progressRecords.length;
    const average_accuracy = total_lessons > 0 ? (total_score / (total_lessons * 100)) * 100 : 0.0;

    await prisma.leaderboard.upsert({
        where: { user_id: userId },
        update: {
            total_score,
            total_lessons_completed: total_lessons,
            average_accuracy
        },
        create: {
            user_id: userId,
            total_score,
            total_lessons_completed: total_lessons,
            average_accuracy
        }
    });
}

async function updateAllRanks(prisma) {
    const entries = await prisma.leaderboard.findMany({ orderBy: { total_score: 'desc' } });
    for (let i = 0; i < entries.length; i++) {
        await prisma.leaderboard.update({
            where: { id: entries[i].id },
            data: { rank: i + 1 }
        });
    }
}

// GET /progress
router.get('/progress', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        const progress = await prisma.learningProgress.findMany({ where: { user_id: userId } });
        res.status(200).json(progress.map(p => ({
            lesson_title: p.lesson_title,
            category: p.category,
            score: p.score,
            completed_at: p.completed_at.toISOString()
        })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /progress
router.post('/progress', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { lesson_title, category, score = 0, time_spent = 0, accuracy = 0.0 } = req.body;

    try {
        const existing = await prisma.learningProgress.findFirst({
            where: { user_id: userId, lesson_title }
        });

        let p;
        if (existing) {
            p = await prisma.learningProgress.update({
                where: { id: existing.id },
                data: {
                    score,
                    best_score: Math.max(existing.best_score, score),
                    attempts: existing.attempts + 1,
                    time_spent: existing.time_spent + time_spent,
                    accuracy,
                    session_count: existing.session_count + 1,
                    completed_at: new Date(),
                    last_attempt: new Date()
                }
            });
        } else {
            p = await prisma.learningProgress.create({
                data: {
                    user_id: userId,
                    lesson_title,
                    category,
                    score,
                    best_score: score,
                    attempts: 1,
                    time_spent,
                    accuracy,
                    session_count: 1
                }
            });
        }

        await updateLeaderboard(prisma, userId);

        res.status(200).json({
            message: "Progress saved successfully",
            lesson_title,
            score,
            best_score: p.best_score,
            attempts: p.attempts,
            session_count: p.session_count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /locks
router.get('/locks', async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const locks = await prisma.lessonLock.findMany({ where: { is_locked: true } });
        res.status(200).json(locks.map(l => ({ target_type: l.target_type, target_name: l.target_name })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /locks/toggle
router.post('/locks/toggle', authenticateToken, requireAdmin, async (req, res) => {
    const prisma = req.app.get('prisma');
    const { target_type, target_name } = req.body;

    try {
        const lock = await prisma.lessonLock.findFirst({ where: { target_type, target_name } });

        let status;
        if (lock) {
            await prisma.lessonLock.delete({ where: { id: lock.id } });
            status = "unlocked";
        } else {
            await prisma.lessonLock.create({ data: { target_type, target_name, is_locked: true } });
            status = "locked";
        }

        res.status(200).json({ msg: `Target ${status} successfully`, status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /leaderboard
router.get('/leaderboard', async (req, res) => {
    const prisma = req.app.get('prisma');
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    try {
        await updateAllRanks(prisma);

        const entries = await prisma.leaderboard.findMany({
            where: { user: { is_banned: false } },
            include: { user: true },
            orderBy: { total_score: 'desc' },
            skip: offset,
            take: limit
        });

        res.status(200).json(entries.map(entry => leaderboardEntryToDict(entry, entry.user)));
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /leaderboard/me
router.get('/leaderboard/me', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        await updateAllRanks(prisma);

        const entry = await prisma.leaderboard.findUnique({ where: { user_id: userId } });
        if (!entry) return res.status(404).json({ msg: "No leaderboard data found" });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        res.status(200).json(leaderboardEntryToDict(entry, user));
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /leaderboard/user/:id
router.get('/leaderboard/user/:id', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.params.id);

    try {
        await updateAllRanks(prisma);

        const entry = await prisma.leaderboard.findUnique({ where: { user_id: userId } });
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!entry || !user || user.is_banned) {
            return res.status(404).json({ msg: "User not found or no data" });
        }

        res.status(200).json(leaderboardEntryToDict(entry, user));
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
