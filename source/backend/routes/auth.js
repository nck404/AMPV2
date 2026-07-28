const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' }); // simple setup for now

function generateRandomPublicId() {
    return Math.random().toString().substring(2, 8);
}

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// POST /register
router.post('/register', async (req, res) => {
    const prisma = req.app.get('prisma');
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ msg: "Missing required fields" });
    }

    try {
        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) return res.status(400).json({ msg: "Username already exists" });

        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) return res.status(400).json({ msg: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        let public_id;
        while (true) {
            public_id = generateRandomPublicId();
            const existingPid = await prisma.user.findUnique({ where: { public_id } });
            if (!existingPid) break;
        }

        await prisma.user.create({
            data: {
                username,
                email,
                password_hash,
                public_id
            }
        });

        res.status(201).json({ msg: "User created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    const prisma = req.app.get('prisma');
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Missing field" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ msg: "Bad email or password" });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ msg: "Bad email or password" });

        // Include is_admin in token for requireAdmin middleware
        const access_token = jwt.sign(
            { sub: user.id.toString(), is_admin: user.is_admin },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            access_token,
            user: {
                id: user.id,
                public_id: user.public_id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                is_admin: user.is_admin,
                avatar_url: user.avatar_url
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require('crypto');

// POST /google-login
router.post('/google-login', async (req, res) => {
    const prisma = req.app.get('prisma');
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ msg: "Missing token" });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ msg: "Email not provided by Google" });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            let public_id;
            while (true) {
                public_id = generateRandomPublicId();
                const existingPid = await prisma.user.findUnique({ where: { public_id } });
                if (!existingPid) break;
            }

            let username = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'user';
            const existingUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUsername) {
                username = `${username}${Math.random().toString(36).substring(2, 6)}`;
            }

            const randomPassword = crypto.randomBytes(32).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(randomPassword, salt);

            user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password_hash,
                    public_id,
                    avatar_url: picture || null,
                    bio: "Chào mừng đến với cộng đồng AMP (Đăng nhập qua Google)"
                }
            });
        }

        const access_token = jwt.sign(
            { sub: user.id.toString(), is_admin: user.is_admin },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            access_token,
            user: {
                id: user.id,
                public_id: user.public_id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                is_admin: user.is_admin,
                avatar_url: user.avatar_url
            }
        });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(400).json({ msg: "Xác thực Google thất bại" });
    }
});

// GET /me
router.get('/me', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.status(200).json({
            id: user.id,
            public_id: user.public_id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            is_admin: user.is_admin,
            avatar_url: user.avatar_url
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /me
router.put('/me', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { username, public_id, bio, links } = req.body;

    if (public_id && !/^[a-zA-Z0-9]+$/.test(public_id)) {
        return res.status(400).json({ msg: "Public ID must be alphanumeric only" });
    }

    try {
        if (public_id) {
            const existing = await prisma.user.findUnique({ where: { public_id } });
            if (existing && existing.id !== userId) {
                return res.status(400).json({ msg: "Public ID already taken" });
            }
        }
        
        if (username) {
            const existingUser = await prisma.user.findUnique({ where: { username } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ msg: "Username already taken" });
            }
        }

        const dataToUpdate = {};
        if (username !== undefined) dataToUpdate.username = username;
        if (public_id !== undefined) dataToUpdate.public_id = public_id;
        if (bio !== undefined) dataToUpdate.bio = bio;
        
        // Note: links might require a separate table or a JSON field. 
        // We'll ignore links for now since it's not in schema.prisma

        await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate
        });

        res.status(200).json({ msg: "Profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /me/bio
router.put('/me/bio', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { bio } = req.body;

    if (bio === undefined) return res.status(400).json({ msg: "Missing bio" });

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { bio }
        });
        res.status(200).json({ msg: "Bio updated", bio });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /me/avatar/upload
router.post('/me/avatar/upload', authenticateToken, upload.single('avatar'), async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    if (!req.file) {
        return res.status(400).json({ msg: "No selected file" });
    }

    try {
        const ext = path.extname(req.file.originalname) || ".jpg";
        const filename = `avatar_${userId}_${Math.random().toString(36).substring(2, 10)}${ext}`;
        const targetPath = path.join(__dirname, '..', 'uploads', filename);

        fs.renameSync(req.file.path, targetPath);

        const avatar_url = `/uploads/${filename}`;
        await prisma.user.update({
            where: { id: userId },
            data: { avatar_url }
        });

        res.status(200).json({ msg: "Avatar uploaded successfully", avatar_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /me/email
router.put('/me/email', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Missing email" });

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== userId) {
            return res.status(400).json({ msg: "Email already in use" });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { email }
        });

        res.status(200).json({ msg: "Email updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /me/password
router.put('/me/password', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
        return res.status(400).json({ msg: "Missing password fields" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isMatch) return res.status(401).json({ msg: "Incorrect current password" });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(new_password, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { password_hash }
        });

        res.status(200).json({ msg: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /notifications
router.get('/notifications', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        const notifs = await prisma.notification.findMany({
            where: {
                OR: [
                    { user_id: userId },
                    { user_id: null }
                ]
            },
            orderBy: { created_at: 'desc' },
            take: 20
        });

        res.status(200).json({ notifications: notifs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// PUT /notifications/read-all
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
    const prisma = req.app.get('prisma');
    const userId = parseInt(req.user.sub);

    try {
        await prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true }
        });

        res.status(200).json({ msg: "Notifications updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
