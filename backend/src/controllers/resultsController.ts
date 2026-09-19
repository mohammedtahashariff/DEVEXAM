import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalAssessments,
      activeAssessments,
      totalCandidates,
      totalRegistered,
      completedAttempts,
      allAttempts,
      proctoringEvents
    ] = await Promise.all([
      prisma.assessment.count(),
      prisma.assessment.count({ where: { status: 'ACTIVE' } }),
      prisma.candidateAttempt.count(),
      prisma.candidateAccount.count(),
      prisma.candidateAttempt.findMany({
        where: { status: { in: ['SUBMITTED', 'EXPIRED'] } },
        select: { score: true }
      }),
      prisma.candidateAttempt.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          assessment: { select: { title: true, code: true } }
        }
      }),
      prisma.proctoringEvent.count({
        where: { severity: { in: ['WARNING', 'DANGER', 'CRITICAL'] } }
      })
    ]);

    const completedCount = completedAttempts.length;
    const avgScore = completedCount > 0
      ? Math.round(completedAttempts.reduce((acc, curr) => acc + curr.score, 0) / completedCount)
      : 0;

    const flaggedCount = await prisma.candidateAttempt.count({
      where: {
        OR: [
          { tabSwitches: { gte: 2 } },
          { fullscreenExits: { gte: 2 } },
          { cameraStatus: 'DISCONNECTED' }
        ]
      }
    });

    // Chart Data: Score Distribution
    const scoreRanges = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 }
    ];

    completedAttempts.forEach(att => {
      if (att.score <= 20) scoreRanges[0].count++;
      else if (att.score <= 40) scoreRanges[1].count++;
      else if (att.score <= 60) scoreRanges[2].count++;
      else if (att.score <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    // Chart Data: Participation by Assessment
    const assessmentsWithAttempts = await prisma.assessment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { attempts: true } },
        attempts: {
          where: { status: 'SUBMITTED' },
          select: { score: true }
        }
      }
    });

    const participationData = assessmentsWithAttempts.map(a => ({
      name: a.title.length > 18 ? `${a.title.substring(0, 16)}...` : a.title,
      candidates: a._count.attempts,
      avgScore: a.attempts.length > 0
        ? Math.round(a.attempts.reduce((acc, c) => acc + c.score, 0) / a.attempts.length)
        : 0
    }));

    // Weekly Activity Trends
    const activityTrend = [
      { day: 'Mon', submissions: 14, violations: 2 },
      { day: 'Tue', submissions: 28, violations: 5 },
      { day: 'Wed', submissions: 42, violations: 8 },
      { day: 'Thu', submissions: 35, violations: 3 },
      { day: 'Fri', submissions: 58, violations: 7 },
      { day: 'Sat', submissions: 22, violations: 1 },
      { day: 'Sun', submissions: 18, violations: 2 }
    ];

    return res.json({
      success: true,
      stats: {
        totalAssessments,
        activeAssessments,
        totalCandidates: Math.max(totalCandidates, totalRegistered),
        registeredStudents: totalRegistered,
        completedTests: completedCount,
        averageScore: avgScore,
        flaggedSessions: flaggedCount,
        totalProctoringViolations: proctoringEvents
      },
      charts: {
        scoreRanges,
        participationData,
        activityTrend
      },
      recentCandidates: allAttempts.map(att => ({
        id: att.id,
        name: att.candidateName,
        email: att.candidateEmail,
        assessmentTitle: att.assessment.title,
        assessmentCode: att.assessment.code,
        status: att.status,
        score: att.score,
        tabSwitches: att.tabSwitches,
        fullscreenExits: att.fullscreenExits,
        submittedAt: att.submittedAt,
        createdAt: att.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics' });
  }
};

export const getAllCandidates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assessmentId, search, status } = req.query;
    const searchStr = search ? String(search).trim() : '';

    // ── 1. Fetch all registered CandidateAccounts ────────────────────────────
    const accountWhere: any = {};
    if (searchStr) {
      accountWhere.OR = [
        { name:  { contains: searchStr } },
        { email: { contains: searchStr } }
      ];
    }
    const accounts = await prisma.candidateAccount.findMany({
      where: accountWhere,
      orderBy: { createdAt: 'desc' }
    });

    // ── 2. Fetch CandidateAttempts ───────────────────────────────────────────
    const attemptWhere: any = {};
    if (assessmentId && assessmentId !== 'all') {
      attemptWhere.assessmentId = String(assessmentId);
    }
    if (status && status !== 'all') {
      attemptWhere.status = String(status);
    }
    if (searchStr) {
      attemptWhere.OR = [
        { candidateName:  { contains: searchStr } },
        { candidateEmail: { contains: searchStr } }
      ];
    }
    const attempts = await prisma.candidateAttempt.findMany({
      where: attemptWhere,
      orderBy: { createdAt: 'desc' },
      include: {
        assessment: {
          select: { id: true, title: true, code: true, passingScore: true, durationMinutes: true }
        },
        _count: { select: { events: true, answers: true } }
      }
    });

    // Build a set of emails that already have attempts
    const emailsWithAttempts = new Set(attempts.map(a => a.candidateEmail.toLowerCase()));

    // ── 3. Format attempt rows ───────────────────────────────────────────────
    const attemptRows = attempts.map(a => {
      const totalFlags = a.tabSwitches + a.fullscreenExits + (a.cameraStatus === 'DISCONNECTED' ? 1 : 0);
      return {
        id: a.id,
        name: a.candidateName,
        email: a.candidateEmail,
        assessmentId: a.assessment.id,
        assessmentTitle: a.assessment.title,
        assessmentCode: a.assessment.code,
        passingScore: a.assessment.passingScore,
        status: a.status,
        score: a.score,
        isPassed: a.score >= a.assessment.passingScore,
        startedAt: a.startTime,
        submittedAt: a.submittedAt,
        durationTakenMinutes: a.startTime && a.submittedAt
          ? Math.round((new Date(a.submittedAt).getTime() - new Date(a.startTime).getTime()) / 60000)
          : null,
        tabSwitches: a.tabSwitches,
        fullscreenExits: a.fullscreenExits,
        cameraStatus: a.cameraStatus,
        activityFlags: totalFlags,
        eventsCount: a._count.events,
        answersCount: a._count.answers,
        isRegistered: true,
        hasAttempt: true
      };
    });

    // ── 4. Registered-only rows (no attempts yet) ────────────────────────────
    // Skip if filtering by assessmentId or attempt status — those don't apply
    const registeredOnlyRows = (assessmentId && assessmentId !== 'all') || (status && status !== 'all')
      ? []
      : accounts
          .filter(acc => !emailsWithAttempts.has(acc.email.toLowerCase()))
          .map(acc => ({
            id: acc.id,
            name: acc.name,
            email: acc.email,
            assessmentId: null,
            assessmentTitle: null,
            assessmentCode: null,
            passingScore: null,
            status: 'REGISTERED',
            score: 0,
            isPassed: false,
            startedAt: null,
            submittedAt: null,
            durationTakenMinutes: null,
            tabSwitches: 0,
            fullscreenExits: 0,
            cameraStatus: 'UNKNOWN',
            activityFlags: 0,
            eventsCount: 0,
            answersCount: 0,
            isRegistered: true,
            hasAttempt: false,
            registeredAt: acc.createdAt
          }));

    const candidates = [...attemptRows, ...registeredOnlyRows];

    return res.json({ success: true, candidates });
  } catch (error: any) {
    console.error('Fetch candidates error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve candidates' });
  }
};

export const getCandidateAttemptResult = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { attemptId } = req.params;

    const attempt = await prisma.candidateAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: { testCases: true }
            }
          }
        },
        answers: true,
        events: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    // Map questions with candidate answer
    const questionsBreakdown = attempt.assessment.questions.map(q => {
      const answer = attempt.answers.find(a => a.questionId === q.id);
      return {
        questionId: q.id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        points: q.points,
        candidateCode: answer ? answer.code : '',
        candidateLanguage: answer ? answer.language : 'python',
        status: answer ? answer.status : 'NOT_ATTEMPTED',
        scoreEarned: answer ? answer.score : 0,
        testCasesPassed: answer ? answer.testCasesPassed : 0,
        testCasesTotal: q.testCases.length,
        executionTime: answer?.executionTime || '0.00s',
        memoryUsage: answer?.memoryUsage || '0MB',
        testCases: q.testCases.map(tc => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          explanation: tc.explanation
        }))
      };
    });

    const timeTakenMinutes = attempt.startTime && attempt.submittedAt
      ? Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startTime).getTime()) / 60000)
      : null;

    return res.json({
      success: true,
      result: {
        attemptId: attempt.id,
        candidateName: attempt.candidateName,
        candidateEmail: attempt.candidateEmail,
        assessmentTitle: attempt.assessment.title,
        assessmentCode: attempt.assessment.code,
        passingScore: attempt.assessment.passingScore,
        finalScore: attempt.score,
        isPassed: attempt.score >= attempt.assessment.passingScore,
        status: attempt.status,
        startTime: attempt.startTime,
        submittedAt: attempt.submittedAt,
        timeTakenMinutes,
        tabSwitches: attempt.tabSwitches,
        fullscreenExits: attempt.fullscreenExits,
        cameraStatus: attempt.cameraStatus,
        micStatus: attempt.micStatus,
        questions: questionsBreakdown,
        proctoringEvents: attempt.events.map(e => ({
          id: e.id,
          eventType: e.eventType,
          severity: e.severity,
          questionId: e.questionId,
          timestamp: e.timestamp,
          details: JSON.parse(e.detailsJson || '{}')
        }))
      }
    });
  } catch (error: any) {
    console.error('Candidate result error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve attempt result' });
  }
};
