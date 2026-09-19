"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const assessmentController_js_1 = require("../controllers/assessmentController.js");
const candidateController_js_1 = require("../controllers/candidateController.js");
const codeController_js_1 = require("../controllers/codeController.js");
const proctoringController_js_1 = require("../controllers/proctoringController.js");
const resultsController_js_1 = require("../controllers/resultsController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', platform: 'DEV EXAM', timestamp: new Date() });
});
// Auth Routes
router.post('/auth/admin/login', authController_js_1.loginAdmin);
router.post('/auth/admin/register', authController_js_1.registerAdmin);
router.post('/auth/candidate/login', authController_js_1.candidateLogin);
router.post('/auth/candidate/register', authController_js_1.candidateRegister);
router.post('/auth/candidate/account-login', authController_js_1.candidateAccountLogin);
router.get('/auth/me', auth_js_1.authenticateToken, authController_js_1.getMe);
// Assessment Management (Admin)
router.get('/assessments', auth_js_1.authenticateToken, auth_js_1.requireAdmin, assessmentController_js_1.getAllAssessments);
router.get('/assessments/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, assessmentController_js_1.getAssessmentById);
router.post('/assessments', auth_js_1.authenticateToken, auth_js_1.requireAdmin, assessmentController_js_1.createAssessment);
router.put('/assessments/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, assessmentController_js_1.updateAssessment);
router.post('/assessments/:id/duplicate', auth_js_1.authenticateToken, auth_js_1.requireAdmin, assessmentController_js_1.duplicateAssessment);
router.delete('/assessments/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, assessmentController_js_1.deleteAssessment);
// Candidate Assessment Session (Candidate)
router.post('/candidate/join', auth_js_1.authenticateToken, candidateController_js_1.joinAssessment);
router.get('/candidate/assessment', auth_js_1.authenticateToken, candidateController_js_1.getCandidateAssessment);
router.post('/candidate/start', auth_js_1.authenticateToken, candidateController_js_1.startAssessment);
router.post('/candidate/system-check', auth_js_1.authenticateToken, candidateController_js_1.updateSystemCheck);
router.post('/assessment/autosave', auth_js_1.authenticateToken, candidateController_js_1.autosaveCode);
router.post('/candidate/submit', auth_js_1.authenticateToken, candidateController_js_1.submitAssessment);
router.get('/candidate/results', auth_js_1.authenticateToken, candidateController_js_1.getMyResults);
router.post('/candidate/exit-to-dashboard', auth_js_1.authenticateToken, candidateController_js_1.exitToDashboard);
// Code Execution
router.post('/code/run', auth_js_1.authenticateToken, codeController_js_1.runCode);
// Proctoring Telemetry
router.post('/proctoring/log', auth_js_1.authenticateToken, proctoringController_js_1.logProctoringEvent);
router.get('/proctoring/logs', auth_js_1.authenticateToken, auth_js_1.requireAdmin, proctoringController_js_1.getProctoringLogs);
router.get('/proctoring/live-candidates', auth_js_1.authenticateToken, auth_js_1.requireAdmin, proctoringController_js_1.getLiveCandidateMonitoring);
// Analytics & Results (Admin)
router.get('/analytics/dashboard', auth_js_1.authenticateToken, auth_js_1.requireAdmin, resultsController_js_1.getDashboardStats);
router.get('/candidates', auth_js_1.authenticateToken, auth_js_1.requireAdmin, resultsController_js_1.getAllCandidates);
router.get('/results/attempt/:attemptId', auth_js_1.authenticateToken, auth_js_1.requireAdmin, resultsController_js_1.getCandidateAttemptResult);
exports.default = router;
