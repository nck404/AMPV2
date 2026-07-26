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
            include: { 
                author: true,
                _count: { select: { comments: true } },
                reactions: true
            }
        });

        const result = posts.map(post => {
            const reactions_count = {};
            if (post.reactions) {
                for (const r of post.reactions) {
                    reactions_count[r.type] = (reactions_count[r.type] || 0) + 1;
                }
            }

            return {
                id: post.id,
                title: post.title,
                content: post.content,
                tags: post.tags ? post.tags.split(',') : [],
                upvotes: post.upvotes,
                reactions: reactions_count,
                comments_count: post._count.comments,
                time: post.created_at.toISOString().replace('T', ' ').substring(0, 19),
                author: serializeAuthor(post.author)
            };
        });
        
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
            include: { 
                author: true,
                reactions: true
            }
        });

        if (!post) return res.status(404).json({ msg: "Post not found" });

        const reactions_count = {};
        let user_reaction = null;
        if (post.reactions) {
            for (const r of post.reactions) {
                reactions_count[r.type] = (reactions_count[r.type] || 0) + 1;
                if (userId && r.user_id === userId) {
                    user_reaction = r.type;
                }
            }
        }

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

// In-memory builder for comments to avoid N+1 query problem
function serializeCommentsInMemory(comments, parentId, userId) {
    const result = [];
    const children = comments.filter(c => c.parent_id === parentId);
    
    for (const c of children) {
        const reactions_count = {};
        let user_reaction = null;
        
        if (c.reactions) {
            for (const r of c.reactions) {
                reactions_count[r.type] = (reactions_count[r.type] || 0) + 1;
                if (userId && r.user_id === userId) {
                    user_reaction = r.type;
                }
            }
        }

        result.push({
            id: c.id,
            content: c.content,
            time: c.created_at.toISOString().replace('T', ' ').substring(0, 19),
            reactions: reactions_count,
            user_reaction,
            author: serializeAuthor(c.author),
            replies: serializeCommentsInMemory(comments, c.id, userId)
        });
    }
    return result;
}

// GET /posts/:id/comments
router.get('/posts/:id/comments', optionalAuthenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const postId = parseInt(req.params.id);
    const userId = req.user ? parseInt(req.user.sub) : null;

    try {
        const comments = await prisma.comment.findMany({
            where: { post_id: postId },
            orderBy: { created_at: 'desc' },
            include: { 
                author: true,
                reactions: true
            }
        });

        // Group comments by parent_id in memory
        const result = serializeCommentsInMemory(comments, null, userId);

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
