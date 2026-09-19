import { Router } from 'express';
import {
  loginAdmin,
  registerAdmin,
  candidateLogin,
  candidateRegister,
  candidateAccountLogin,
  getMe
} from '../controllers/authController.js';
import {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  duplicateAssessment,
  deleteAssessment
} from '../controllers/assessmentController.js';
import {
  getCandidateAssessment,
  startAssessment,
  autosaveCode,
  submitAssessment,
  updateSystemCheck,
  joinAssessment,
  getMyResults,
  exitToDashboard
} from '../controllers/candidateController.js';
import { runCode } from '../controllers/codeController.js';
import {
  logProctoringEvent,
  getProctoringLogs,
  getLiveCandidateMonitoring
} from '../controllers/proctoringController.js';
import {
  getDashboardStats,
  getAllCandidates,
  getCandidateAttemptResult
} from '../controllers/resultsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', platform: 'DEV EXAM', timestamp: new Date() });
});

// Auth Routes
router.post('/auth/admin/login', loginAdmin);
router.post('/auth/admin/register', registerAdmin);
router.post('/auth/candidate/login', candidateLogin);
router.post('/auth/candidate/register', candidateRegister);
router.post('/auth/candidate/account-login', candidateAccountLogin);
router.get('/auth/me', authenticateToken, getMe);

// Assessment Management (Admin)
router.get('/assessments', authenticateToken, requireAdmin, getAllAssessments);
router.get('/assessments/:id', authenticateToken, requireAdmin, getAssessmentById);
router.post('/assessments', authenticateToken, requireAdmin, createAssessment);
router.put('/assessments/:id', authenticateToken, requireAdmin, updateAssessment);
router.post('/assessments/:id/duplicate', authenticateToken, requireAdmin, duplicateAssessment);
router.delete('/assessments/:id', authenticateToken, requireAdmin, deleteAssessment);

// Candidate Assessment Session (Candidate)
router.post('/candidate/join', authenticateToken, joinAssessment);
router.get('/candidate/assessment', authenticateToken, getCandidateAssessment);
router.post('/candidate/start', authenticateToken, startAssessment);
router.post('/candidate/system-check', authenticateToken, updateSystemCheck);
router.post('/assessment/autosave', authenticateToken, autosaveCode);
router.post('/candidate/submit', authenticateToken, submitAssessment);
router.get('/candidate/results', authenticateToken, getMyResults);
router.post('/candidate/exit-to-dashboard', authenticateToken, exitToDashboard);

// Code Execution
router.post('/code/run', authenticateToken, runCode);

// Proctoring Telemetry
router.post('/proctoring/log', authenticateToken, logProctoringEvent);
router.get('/proctoring/logs', authenticateToken, requireAdmin, getProctoringLogs);
router.get('/proctoring/live-candidates', authenticateToken, requireAdmin, getLiveCandidateMonitoring);

// Analytics & Results (Admin)
router.get('/analytics/dashboard', authenticateToken, requireAdmin, getDashboardStats);
router.get('/candidates', authenticateToken, requireAdmin, getAllCandidates);
router.get('/results/attempt/:attemptId', authenticateToken, requireAdmin, getCandidateAttemptResult);

export default router;
