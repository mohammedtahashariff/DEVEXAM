"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.candidateAccountLogin = exports.candidateRegister = exports.candidateLogin = exports.registerAdmin = exports.loginAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../db.js");
const JWT_SECRET = process.env.JWT_SECRET || 'devexam-super-secure-recruitment-jwt-secret-2026';
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await db_js_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.loginAdmin = loginAdmin;
const registerAdmin = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const existing = await db_js_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = await db_js_1.prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name,
                role: 'ADMIN'
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.registerAdmin = registerAdmin;
const candidateLogin = async (req, res) => {
    try {
        const { name, email, assessmentCode } = req.body;
        if (!name || !email || !assessmentCode) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and assessment code are required'
            });
        }
        const code = assessmentCode.trim().toUpperCase();
        const assessment = await db_js_1.prisma.assessment.findUnique({
            where: { code },
            include: {
                questions: {
                    select: { id: true, title: true, difficulty: true, points: true, orderIndex: true }
                }
            }
        });
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found. Please verify the code.' });
        }
        if (assessment.status !== 'ACTIVE') {
            return res.status(400).json({ success: false, message: 'This assessment is currently not active.' });
        }
        // Find or create candidate attempt
        let attempt = await db_js_1.prisma.candidateAttempt.findFirst({
            where: {
                assessmentId: assessment.id,
                candidateEmail: email.toLowerCase()
            }
        });
        if (!attempt) {
            attempt = await db_js_1.prisma.candidateAttempt.create({
                data: {
                    assessmentId: assessment.id,
                    candidateName: name.trim(),
                    candidateEmail: email.toLowerCase(),
                    accessCode: code,
                    status: 'NOT_STARTED',
                    totalQuestions: assessment.questions.length
                }
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: attempt.id,
            email: attempt.candidateEmail,
            name: attempt.candidateName,
            role: 'CANDIDATE',
            attemptId: attempt.id,
            assessmentId: assessment.id
        }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            success: true,
            token,
            attempt,
            assessment: {
                id: assessment.id,
                code: assessment.code,
                title: assessment.title,
                description: assessment.description,
                durationMinutes: assessment.durationMinutes,
                passingScore: assessment.passingScore,
                allowedLanguages: assessment.allowedLanguages.split(','),
                questionCount: assessment.questions.length
            }
        });
    }
    catch (error) {
        console.error('Candidate login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.candidateLogin = candidateLogin;
const candidateRegister = async (req, res) => {
    try {
        const { name, email, password, assessmentCode } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }
        const emailLower = email.toLowerCase().trim();
        // Check if a candidate user with same email already exists
        const existing = await db_js_1.prisma.candidateAccount.findUnique({
            where: { email: emailLower }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login.' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const account = await db_js_1.prisma.candidateAccount.create({
            data: {
                name: name.trim(),
                email: emailLower,
                passwordHash
            }
        });
        // If an assessment code is provided, validate it exists
        let assessmentInfo = null;
        if (assessmentCode) {
            const code = assessmentCode.trim().toUpperCase();
            assessmentInfo = await db_js_1.prisma.assessment.findUnique({
                where: { code },
                select: { id: true, code: true, title: true, durationMinutes: true, allowedLanguages: true, status: true }
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: account.id,
            email: account.email,
            name: account.name,
            role: 'CANDIDATE',
            accountId: account.id
        }, JWT_SECRET, { expiresIn: '24h' });
        return res.status(201).json({
            success: true,
            token,
            account: { id: account.id, email: account.email, name: account.name },
            assessment: assessmentInfo
        });
    }
    catch (error) {
        console.error('Candidate register error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.candidateRegister = candidateRegister;
const candidateAccountLogin = async (req, res) => {
    try {
        const { email, password, assessmentCode } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const emailLower = email.toLowerCase().trim();
        const account = await db_js_1.prisma.candidateAccount.findUnique({ where: { email: emailLower } });
        if (!account) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, account.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        // If assessment code given, also validate it
        if (assessmentCode) {
            const code = assessmentCode.trim().toUpperCase();
            const assessment = await db_js_1.prisma.assessment.findUnique({ where: { code } });
            if (!assessment) {
                return res.status(404).json({ success: false, message: 'Assessment code not found' });
            }
            // Create or reuse attempt
            let attempt = await db_js_1.prisma.candidateAttempt.findFirst({
                where: { assessmentId: assessment.id, candidateEmail: emailLower }
            });
            if (!attempt) {
                const totalQ = await db_js_1.prisma.question.count({ where: { assessmentId: assessment.id } });
                attempt = await db_js_1.prisma.candidateAttempt.create({
                    data: {
                        assessmentId: assessment.id,
                        candidateName: account.name,
                        candidateEmail: emailLower,
                        accessCode: code,
                        status: 'NOT_STARTED',
                        totalQuestions: totalQ
                    }
                });
            }
            const token = jsonwebtoken_1.default.sign({ id: attempt.id, email: emailLower, name: account.name, role: 'CANDIDATE', attemptId: attempt.id, assessmentId: assessment.id }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({
                success: true,
                token,
                attempt,
                assessment: {
                    id: assessment.id,
                    code: assessment.code,
                    title: assessment.title,
                    durationMinutes: assessment.durationMinutes,
                    passingScore: assessment.passingScore,
                    allowedLanguages: assessment.allowedLanguages.split(','),
                    questionCount: await db_js_1.prisma.question.count({ where: { assessmentId: assessment.id } })
                }
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: account.id, email: account.email, name: account.name, role: 'CANDIDATE', accountId: account.id }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ success: true, token, account: { id: account.id, email: account.email, name: account.name } });
    }
    catch (error) {
        console.error('Candidate account login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.candidateAccountLogin = candidateAccountLogin;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (req.user.role === 'ADMIN') {
            const user = await db_js_1.prisma.user.findUnique({ where: { id: req.user.id } });
            if (!user)
                return res.status(404).json({ success: false, message: 'User not found' });
            return res.json({
                success: true,
                user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl }
            });
        }
        else {
            // Candidate — two token shapes:
            //  1. attempt token: { attemptId, assessmentId }
            //  2. account-only token: { accountId } (no attempt yet)
            if (req.user.attemptId) {
                const attempt = await db_js_1.prisma.candidateAttempt.findUnique({
                    where: { id: req.user.attemptId },
                    include: { assessment: true }
                });
                return res.json({
                    success: true,
                    user: { ...req.user },
                    attempt
                });
            }
            else {
                // Account-only — just return user info, no attempt
                return res.json({
                    success: true,
                    user: { id: req.user.id, email: req.user.email, name: req.user.name, role: 'CANDIDATE', accountId: req.user.id }
                });
            }
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMe = getMe;
