const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/auth');

const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

async function buildReactionsCount(prisma, targetType, targetId) {
    const reactionsCount = {};
    for (const rType of REACTION_TYPES) {
        const count = await prisma.reaction.count({
            where: { [targetType]: targetId, type: rType }
        });
        if (count > 0) {
            reactionsCount[rType] = count;
        }
    }
    return reactionsCount;
}

async function getUserReaction(prisma, targetType, targetId, userId) {
    if (!userId) return null;
    const reaction = await prisma.reaction.findFirst({
        where: { [targetType]: targetId, user_id: userId }
    });
    return reaction ? reaction.type : null;
}

function serializeAuthor(user) {
    if (!user) return null;
    return {
        username: user.username,
        public_id: user.public_id,
        avatar_url: user.avatar_url,
        is_admin: user.is_admin
    };
}

// GET /posts
router.get('/posts', async (req, res) => {
    const prisma = req.app.get('prisma');

    try {
        const posts = await prisma.post.findMany({
            orderBy: { created_at: 'desc' },
            include: { author: true }
        });

        const result = [];
        for (const post of posts) {
            const reactions_count = await buildReactionsCount(prisma, 'post_id', post.id);
            const comments_count = await prisma.comment.count({ where: { post_id: post.id } });

            result.push({
                id: post.id,
                title: post.title,
                content: post.content,
                tags: post.tags ? post.tags.split(',') : [],
                upvotes: post.upvotes,
                reactions: reactions_count,
                comments_count,
                time: post.created_at.toISOString().replace('T', ' ').substring(0, 19),
                author: serializeAuthor(post.author)
            });
        }
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /posts
router.post('/posts', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { title, content, tags } = req.body;

    if (!title || !content) {
        return res.status(400).json({ msg: "Missing title or content" });
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                author_id: userId,
                title,
                content,
                tags: tags || ''
            }
        });

        res.status(201).json({ msg: "Post created successfully", id: newPost.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /posts/:id
router.get('/posts/:id', optionalAuthenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const postId = parseInt(req.params.id);
    const userId = req.user ? parseInt(req.user.sub) : null;

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { author: true }
        });

        if (!post) return res.status(404).json({ msg: "Post not found" });

        const user_reaction = await getUserReaction(prisma, 'post_id', post.id, userId);
        const reactions_count = await buildReactionsCount(prisma, 'post_id', post.id);

        res.status(200).json({
            id: post.id,
            title: post.title,
            content: post.content,
            tags: post.tags ? post.tags.split(',') : [],
            upvotes: post.upvotes,
            reactions: reactions_count,
            user_reaction,
            time: post.created_at.toISOString().replace('T', ' ').substring(0, 19),
            author: serializeAuthor(post.author)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Helper for comments
async function serializeCommentTree(prisma, comment, userId) {
    const reactions_count = await buildReactionsCount(prisma, 'comment_id', comment.id);
    const user_reaction = await getUserReaction(prisma, 'comment_id', comment.id, userId);

    const replies = await prisma.comment.findMany({
        where: { parent_id: comment.id },
        include: { author: true }
    });

    const serializedReplies = [];
    for (const reply of replies) {
        serializedReplies.push(await serializeCommentTree(prisma, reply, userId));
    }

    return {
        id: comment.id,
        content: comment.content,
        time: comment.created_at.toISOString().replace('T', ' ').substring(0, 19),
        reactions: reactions_count,
        user_reaction,
        author: serializeAuthor(comment.author),
        replies: serializedReplies
    };
}

// GET /posts/:id/comments
router.get('/posts/:id/comments', optionalAuthenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const postId = parseInt(req.params.id);
    const userId = req.user ? parseInt(req.user.sub) : null;

    try {
        const comments = await prisma.comment.findMany({
            where: { post_id: postId, parent_id: null },
            orderBy: { created_at: 'desc' },
            include: { author: true }
        });

        const result = [];
        for (const c of comments) {
            result.push(await serializeCommentTree(prisma, c, userId));
        }

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /posts/:id/comments
router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const postId = parseInt(req.params.id);
    const { content, parent_id } = req.body;

    if (!content) {
        return res.status(400).json({ msg: "Content is required" });
    }

    try {
        const newComment = await prisma.comment.create({
            data: {
                post_id: postId,
                author_id: userId,
                content,
                parent_id: parent_id || null
            }
        });

        res.status(201).json({ msg: "Comment created", id: newComment.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /react
router.post('/react', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { target_type, target_id, type: reaction_type } = req.body;

    try {
        let existing;
        if (target_type === 'post') {
            existing = await prisma.reaction.findFirst({ where: { post_id: target_id, user_id: userId } });
        } else {
            existing = await prisma.reaction.findFirst({ where: { comment_id: target_id, user_id: userId } });
        }

        if (existing) {
            if (reaction_type === null || existing.type === reaction_type) {
                await prisma.reaction.delete({ where: { id: existing.id } });
                return res.status(200).json({ msg: "Reaction removed" });
            } else {
                await prisma.reaction.update({
                    where: { id: existing.id },
                    data: { type: reaction_type }
                });
                return res.status(200).json({ msg: "Reaction updated" });
            }
        } else {
            if (reaction_type) {
                await prisma.reaction.create({
                    data: {
                        user_id: userId,
                        type: reaction_type,
                        post_id: target_type === 'post' ? target_id : null,
                        comment_id: target_type === 'post' ? null : target_id
                    }
                });
                return res.status(201).json({ msg: "Reaction added" });
            }
        }
        res.status(400).json({ msg: "No action taken" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
