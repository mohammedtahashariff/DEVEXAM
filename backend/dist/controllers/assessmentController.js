"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAssessment = exports.duplicateAssessment = exports.updateAssessment = exports.createAssessment = exports.getAssessmentById = exports.getAllAssessments = void 0;
const db_js_1 = require("../db.js");
// Helper to generate a realistic assessment code e.g. DEVEXAM-7F82K
function generateAssessmentCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `DEVEXAM-${randomPart}`;
}
const getAllAssessments = async (req, res) => {
    try {
        const assessments = await db_js_1.prisma.assessment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { questions: true, attempts: true }
                },
                attempts: {
                    select: {
                        id: true,
                        status: true,
                        score: true
                    }
                }
            }
        });
        const formatted = assessments.map(a => {
            const completed = a.attempts.filter(att => att.status === 'SUBMITTED' || att.status === 'EXPIRED');
            const avgScore = completed.length > 0
                ? Math.round(completed.reduce((acc, curr) => acc + curr.score, 0) / completed.length)
                : 0;
            return {
                id: a.id,
                code: a.code,
                title: a.title,
                description: a.description,
                durationMinutes: a.durationMinutes,
                passingScore: a.passingScore,
                maxAttempts: a.maxAttempts,
                allowedLanguages: a.allowedLanguages.split(','),
                status: a.status,
                startDate: a.startDate,
                endDate: a.endDate,
                createdAt: a.createdAt,
                questionCount: a._count.questions,
                totalCandidates: a._count.attempts,
                completedCandidates: completed.length,
                averageScore: avgScore
            };
        });
        return res.json({ success: true, assessments: formatted });
    }
    catch (error) {
        console.error('Fetch assessments error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve assessments' });
    }
};
exports.getAllAssessments = getAllAssessments;
const getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const assessment = await db_js_1.prisma.assessment.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    include: { testCases: true }
                },
                attempts: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        answers: true,
                        events: true
                    }
                }
            }
        });
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }
        return res.json({ success: true, assessment });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to load assessment' });
    }
};
exports.getAssessmentById = getAssessmentById;
const createAssessment = async (req, res) => {
    try {
        const { title, description, durationMinutes, passingScore, maxAttempts, allowedLanguages, questions } = req.body;
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }
        let code = generateAssessmentCode();
        // Ensure code uniqueness
        let existing = await db_js_1.prisma.assessment.findUnique({ where: { code } });
        while (existing) {
            code = generateAssessmentCode();
            existing = await db_js_1.prisma.assessment.findUnique({ where: { code } });
        }
        const languagesStr = Array.isArray(allowedLanguages)
            ? allowedLanguages.join(',')
            : (allowedLanguages || 'python,javascript,java,cpp');
        const newAssessment = await db_js_1.prisma.assessment.create({
            data: {
                title,
                description,
                code,
                durationMinutes: Number(durationMinutes) || 60,
                passingScore: Number(passingScore) || 70,
                maxAttempts: Number(maxAttempts) || 1,
                allowedLanguages: languagesStr,
                status: 'DRAFT',
                creatorId: req.user?.id,
                questions: {
                    create: (questions || []).map((q, idx) => ({
                        title: q.title || `Problem ${idx + 1}`,
                        description: q.description || '',
                        inputFormat: q.inputFormat || '',
                        outputFormat: q.outputFormat || '',
                        constraints: q.constraints || '',
                        examplesJson: typeof q.examples === 'string' ? q.examples : JSON.stringify(q.examples || []),
                        difficulty: q.difficulty || 'MEDIUM',
                        starterCodesJson: typeof q.starterCodes === 'string' ? q.starterCodes : JSON.stringify(q.starterCodes || {
                            python: 'def solve():\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    solve()',
                            javascript: 'function solve() {\n    // Write your solution here\n}\nsolve();',
                            java: 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}',
                            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}'
                        }),
                        points: Number(q.points) || 100,
                        orderIndex: idx,
                        testCases: {
                            create: (q.testCases || []).map((tc) => ({
                                input: tc.input || '',
                                expectedOutput: tc.expectedOutput || '',
                                isHidden: Boolean(tc.isHidden),
                                explanation: tc.explanation || ''
                            }))
                        }
                    }))
                }
            },
            include: {
                questions: {
                    include: { testCases: true }
                }
            }
        });
        return res.status(201).json({ success: true, assessment: newAssessment });
    }
    catch (error) {
        console.error('Create assessment error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create assessment' });
    }
};
exports.createAssessment = createAssessment;
const updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, durationMinutes, passingScore, status, allowedLanguages } = req.body;
        const languagesStr = Array.isArray(allowedLanguages)
            ? allowedLanguages.join(',')
            : allowedLanguages;
        const updated = await db_js_1.prisma.assessment.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
                ...(passingScore !== undefined && { passingScore: Number(passingScore) }),
                ...(status && { status }),
                ...(languagesStr && { allowedLanguages: languagesStr })
            }
        });
        return res.json({ success: true, assessment: updated });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update assessment' });
    }
};
exports.updateAssessment = updateAssessment;
const duplicateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await db_js_1.prisma.assessment.findUnique({
            where: { id },
            include: {
                questions: {
                    include: { testCases: true }
                }
            }
        });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }
        const newCode = generateAssessmentCode();
        const duplicated = await db_js_1.prisma.assessment.create({
            data: {
                title: `${existing.title} (Copy)`,
                description: existing.description,
                code: newCode,
                durationMinutes: existing.durationMinutes,
                passingScore: existing.passingScore,
                maxAttempts: existing.maxAttempts,
                allowedLanguages: existing.allowedLanguages,
                status: 'ACTIVE',
                creatorId: req.user?.id,
                questions: {
                    create: existing.questions.map((q) => ({
                        title: q.title,
                        description: q.description,
                        inputFormat: q.inputFormat,
                        outputFormat: q.outputFormat,
                        constraints: q.constraints,
                        examplesJson: q.examplesJson,
                        difficulty: q.difficulty,
                        starterCodesJson: q.starterCodesJson,
                        points: q.points,
                        orderIndex: q.orderIndex,
                        testCases: {
                            create: q.testCases.map((tc) => ({
                                input: tc.input,
                                expectedOutput: tc.expectedOutput,
                                isHidden: tc.isHidden,
                                explanation: tc.explanation
                            }))
                        }
                    }))
                }
            },
            include: { questions: true }
        });
        return res.status(201).json({ success: true, assessment: duplicated });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to duplicate assessment' });
    }
};
exports.duplicateAssessment = duplicateAssessment;
const deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        await db_js_1.prisma.assessment.delete({ where: { id } });
        return res.json({ success: true, message: 'Assessment deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to delete assessment' });
    }
};
exports.deleteAssessment = deleteAssessment;
