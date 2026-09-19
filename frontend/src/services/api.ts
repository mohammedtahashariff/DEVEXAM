const API_BASE = (import.meta.env.VITE_API_URL || 'https://devexam-jhbh.onrender.com/api').replace(/\/$/, '');

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('devexam_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async loginAdmin(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async loginCandidate(name: string, email: string, assessmentCode: string) {
    const res = await fetch(`${API_BASE}/auth/candidate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, assessmentCode })
    });
    return res.json();
  },

  async candidateRegister(name: string, email: string, password: string, assessmentCode?: string) {
    const res = await fetch(`${API_BASE}/auth/candidate/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, assessmentCode })
    });
    return res.json();
  },

  async candidateAccountLogin(email: string, password: string, assessmentCode?: string) {
    const res = await fetch(`${API_BASE}/auth/candidate/account-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, assessmentCode })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Assessments (Admin)
  async getAssessments() {
    const res = await fetch(`${API_BASE}/assessments`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getAssessmentById(id: string) {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createAssessment(data: any) {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateAssessment(id: string, data: any) {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async publishAssessment(id: string, status: 'ACTIVE' | 'DRAFT' | 'CLOSED') {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async duplicateAssessment(id: string) {
    const res = await fetch(`${API_BASE}/assessments/${id}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async deleteAssessment(id: string) {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Candidate Assessment Flow
  async getCandidateAssessment() {
    const res = await fetch(`${API_BASE}/candidate/assessment`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async startAssessment() {
    const res = await fetch(`${API_BASE}/candidate/start`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateSystemCheck(cameraStatus: string, micStatus: string) {
    const res = await fetch(`${API_BASE}/candidate/system-check`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cameraStatus, micStatus })
    });
    return res.json();
  },

  async autosaveCode(questionId: string, code: string, language: string, currentQuestionIndex?: number) {
    const res = await fetch(`${API_BASE}/assessment/autosave`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ questionId, code, language, currentQuestionIndex })
    });
    return res.json();
  },

  async submitAssessment(answers?: any) {
    const res = await fetch(`${API_BASE}/candidate/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: answers ? JSON.stringify({ answers }) : undefined
    });
    return res.json();
  },

  async getMyResults() {
    const res = await fetch(`${API_BASE}/candidate/results`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async exitToDashboard() {
    const res = await fetch(`${API_BASE}/candidate/exit-to-dashboard`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Code Runner
  async runCode(data: {
    language: string;
    code: string;
    questionId?: string;
    customInput?: string;
    testCases?: any[];
  }) {
    const res = await fetch(`${API_BASE}/code/run`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Proctoring Telemetry
  async logProctoringEvent(eventType: string, severity?: string, questionId?: string, details?: any) {
    const res = await fetch(`${API_BASE}/proctoring/log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventType, severity, questionId, details })
    });
    return res.json();
  },

  async getProctoringLogs(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await fetch(`${API_BASE}/proctoring/logs${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getLiveCandidates(assessmentId?: string) {
    const query = assessmentId ? `?assessmentId=${assessmentId}` : '';
    const res = await fetch(`${API_BASE}/proctoring/live-candidates${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Analytics & Results
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getAllCandidates(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await fetch(`${API_BASE}/candidates${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getCandidateResult(attemptId: string) {
    const res = await fetch(`${API_BASE}/results/attempt/${attemptId}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
