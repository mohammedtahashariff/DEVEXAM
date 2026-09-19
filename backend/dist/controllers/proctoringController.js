"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiveCandidateMonitoring = exports.getProctoringLogs = exports.logProctoringEvent = void 0;
const db_js_1 = require("../db.js");
const logProctoringEvent = async (req, res) => {
    try {
        const attemptId = req.user?.attemptId || req.user?.id;
        const { eventType, severity, questionId, details } = req.body;
        if (!attemptId || !eventType) {
            return res.status(400).json({ success: false, message: 'attemptId and eventType are required' });
        }
        // Determine severity if not provided
        let calculatedSeverity = severity || 'INFO';
        if (['TAB_SWITCH', 'FULLSCREEN_EXIT', 'CAMERA_DISCONNECT'].includes(eventType)) {
            calculatedSeverity = 'WARNING';
        }
        // Update attempt counters if relevant
        const updateData = {};
        if (eventType === 'TAB_SWITCH') {
            updateData.tabSwitches = { increment: 1 };
        }
        else if (eventType === 'FULLSCREEN_EXIT') {
            updateData.fullscreenExits = { increment: 1 };
        }
        else if (eventType === 'CAMERA_DISCONNECT') {
            updateData.cameraStatus = 'DISCONNECTED';
        }
        else if (eventType === 'CAMERA_CONNECTED') {
            updateData.cameraStatus = 'CONNECTED';
        }
        if (Object.keys(updateData).length > 0) {
            const updated = await db_js_1.prisma.candidateAttempt.update({
                where: { id: attemptId },
                data: updateData
            });
            if (eventType === 'TAB_SWITCH' && updated.tabSwitches >= 5) {
                calculatedSeverity = 'CRITICAL';
            }
        }
        const event = await db_js_1.prisma.proctoringEvent.create({
            data: {
                attemptId,
                eventType,
                severity: calculatedSeverity,
                questionId: questionId || null,
                detailsJson: typeof details === 'string' ? details : JSON.stringify(details || {})
            }
        });
        return res.status(201).json({ success: true, eventId: event.id });
    }
    catch (error) {
        console.error('Proctoring log error:', error);
        return res.status(500).json({ success: false, message: 'Failed to record proctoring log' });
    }
};
exports.logProctoringEvent = logProctoringEvent;
const getProctoringLogs = async (req, res) => {
    try {
        const { assessmentId, candidateName, eventType, severity, page = 1, limit = 50 } = req.query;
        const whereClause = {};
        if (assessmentId && assessmentId !== 'all') {
            whereClause.attempt = { ...whereClause.attempt, assessmentId: String(assessmentId) };
        }
        if (candidateName && String(candidateName).trim() !== '') {
            whereClause.attempt = {
                ...whereClause.attempt,
                candidateName: { contains: String(candidateName) }
            };
        }
        if (eventType && eventType !== 'all') {
            whereClause.eventType = String(eventType);
        }
        if (severity && severity !== 'all') {
            whereClause.severity = String(severity);
        }
        const take = Number(limit);
        const skip = (Number(page) - 1) * take;
        const [total, events] = await Promise.all([
            db_js_1.prisma.proctoringEvent.count({ where: whereClause }),
            db_js_1.prisma.proctoringEvent.findMany({
                where: whereClause,
                orderBy: { timestamp: 'desc' },
                skip,
                take,
                include: {
                    attempt: {
                        select: {
                            id: true,
                            candidateName: true,
                            candidateEmail: true,
                            assessment: {
                                select: { id: true, title: true, code: true }
                            }
                        }
                    }
                }
            })
        ]);
        const formatted = events.map(e => ({
            id: e.id,
            eventType: e.eventType,
            severity: e.severity,
            questionId: e.questionId,
            timestamp: e.timestamp,
            details: JSON.parse(e.detailsJson || '{}'),
            candidate: {
                id: e.attempt.id,
                name: e.attempt.candidateName,
                email: e.attempt.candidateEmail
            },
            assessment: {
                id: e.attempt.assessment.id,
                title: e.attempt.assessment.title,
                code: e.attempt.assessment.code
            }
        }));
        return res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / take),
            logs: formatted
        });
    }
    catch (error) {
        console.error('Fetch proctoring logs error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve logs' });
    }
};
exports.getProctoringLogs = getProctoringLogs;
const getLiveCandidateMonitoring = async (req, res) => {
    try {
        const { assessmentId } = req.query;
        const where = {
            status: { in: ['IN_PROGRESS', 'NOT_STARTED'] }
        };
        if (assessmentId && assessmentId !== 'all') {
            where.assessmentId = String(assessmentId);
        }
        const activeAttempts = await db_js_1.prisma.candidateAttempt.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                assessment: {
                    select: { id: true, title: true, code: true, durationMinutes: true }
                },
                answers: {
                    select: {
                        id: true,
                        status: true,
                        questionId: true,
                        testCasesPassed: true,
                        testCasesTotal: true
                    }
                },
                events: {
                    orderBy: { timestamp: 'desc' },
                    take: 5
                }
            }
        });
        const now = new Date().getTime();
        const liveData = activeAttempts.map(attempt => {
            let remainingSeconds = 0;
            if (attempt.expiresAt) {
                remainingSeconds = Math.max(0, Math.floor((new Date(attempt.expiresAt).getTime() - now) / 1000));
            }
            else {
                remainingSeconds = attempt.assessment.durationMinutes * 60;
            }
            const completedAnswers = attempt.answers.filter(a => a.status === 'PASSED' || a.status === 'FAILED');
            const totalWarnings = attempt.tabSwitches + attempt.fullscreenExits;
            let riskLevel = 'ACTIVE';
            if (totalWarnings >= 3 || attempt.cameraStatus === 'DISCONNECTED') {
                riskLevel = 'REVIEW_REQUIRED';
            }
            else if (totalWarnings >= 1) {
                riskLevel = 'WARNING';
            }
            return {
                id: attempt.id,
                candidateName: attempt.candidateName,
                candidateEmail: attempt.candidateEmail,
                assessmentTitle: attempt.assessment.title,
                assessmentCode: attempt.assessment.code,
                status: attempt.status,
                riskLevel,
                cameraStatus: attempt.cameraStatus,
                micStatus: attempt.micStatus,
                remainingSeconds,
                tabSwitches: attempt.tabSwitches,
                fullscreenExits: attempt.fullscreenExits,
                totalEvents: attempt.events.length,
                questionsSolved: `${completedAnswers.length}/${attempt.totalQuestions || 3}`,
                recentEvents: attempt.events.map(ev => ({
                    eventType: ev.eventType,
                    severity: ev.severity,
                    timestamp: ev.timestamp
                }))
            };
        });
        return res.json({ success: true, candidates: liveData });
    }
    catch (error) {
        console.error('Live monitoring error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve live monitoring feed' });
    }
};
exports.getLiveCandidateMonitoring = getLiveCandidateMonitoring;
