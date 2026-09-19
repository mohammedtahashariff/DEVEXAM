import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CodeRunnerService } from '../services/codeRunner.js';

const JWT_SECRET = process.env.JWT_SECRET || 'devexam-super-secret-key-2024';

export const joinAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assessmentCode } = req.body;
    if (!assessmentCode) {
      return res.status(400).json({ success: false, message: 'Assessment code is required' });
    }

    const code = assessmentCode.trim().toUpperCase();
    const assessment = await prisma.assessment.findUnique({ where: { code } });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found. Check the code and try again.' });
    }
    if (assessment.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'This assessment is not currently active.' });
    }

    const candidateEmail = req.user!.email;
    const candidateName  = req.user!.name;

    // Reuse existing attempt or create a new one
    let attempt = await prisma.candidateAttempt.findFirst({
      where: { assessmentId: assessment.id, candidateEmail }
    });
    if (!attempt) {
      const totalQ = await prisma.question.count({ where: { assessmentId: assessment.id } });
      attempt = await prisma.candidateAttempt.create({
        data: {
          assessmentId: assessment.id,
          candidateName,
          candidateEmail,
          accessCode: code,
          status: 'NOT_STARTED',
          totalQuestions: totalQ
        }
      });
    }

    const token = jwt.sign(
      {
        id: attempt.id,
        email: candidateEmail,
        name: candidateName,
        role: 'CANDIDATE',
        attemptId: attempt.id,
        assessmentId: assessment.id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
        questionCount: await prisma.question.count({ where: { assessmentId: assessment.id } })
      }
    });
  } catch (error: any) {
    console.error('joinAssessment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


export const getCandidateAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attemptId = req.user?.attemptId || req.user?.id;
    if (!attemptId) {
      return res.status(401).json({ success: false, message: 'Invalid candidate attempt session' });
    }

    const attempt = await prisma.candidateAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                testCases: {
                  where: { isHidden: false }, // Only expose public/sample test cases
                  select: {
                    id: true,
                    input: true,
                    expectedOutput: true,
                    explanation: true,
                    isHidden: true
                  }
                }
              }
            }
          }
        },
        answers: true
      }
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    // Check if time expired on server
    if (attempt.expiresAt && new Date() > attempt.expiresAt && attempt.status === 'IN_PROGRESS') {
      await prisma.candidateAttempt.update({
        where: { id: attempt.id },
        data: { status: 'EXPIRED' }
      });
      attempt.status = 'EXPIRED';
    }

    // Calculate remaining seconds based on server timer
    let remainingSeconds = 0;
    if (attempt.expiresAt) {
      const now = new Date().getTime();
      const expiry = new Date(attempt.expiresAt).getTime();
      remainingSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
    } else {
      remainingSeconds = attempt.assessment.durationMinutes * 60;
    }

    return res.json({
      success: true,
      attempt: {
        id: attempt.id,
        candidateName: attempt.candidateName,
        candidateEmail: attempt.candidateEmail,
        status: attempt.status,
        startTime: attempt.startTime,
        expiresAt: attempt.expiresAt,
        remainingSeconds,
        cameraStatus: attempt.cameraStatus,
        micStatus: attempt.micStatus,
        currentQuestionIndex: attempt.currentQuestionIndex,
        answers: attempt.answers
      },
      assessment: {
        id: attempt.assessment.id,
        code: attempt.assessment.code,
        title: attempt.assessment.title,
        description: attempt.assessment.description,
        durationMinutes: attempt.assessment.durationMinutes,
        passingScore: attempt.assessment.passingScore,
        allowedLanguages: attempt.assessment.allowedLanguages.split(','),
        questions: attempt.assessment.questions.map(q => ({
          id: q.id,
          title: q.title,
          description: q.description,
          inputFormat: q.inputFormat,
          outputFormat: q.outputFormat,
          constraints: q.constraints,
          examples: JSON.parse(q.examplesJson || '[]'),
          difficulty: q.difficulty,
          starterCodes: JSON.parse(q.starterCodesJson || '{}'),
          points: q.points,
          orderIndex: q.orderIndex,
          sampleTestCases: q.testCases
        }))
      }
    });
  } catch (error: any) {
    console.error('Candidate assessment fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve assessment data' });
  }
};

export const startAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attemptId = req.user?.attemptId || req.user?.id;
    const attempt = await prisma.candidateAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: { include: { questions: true } } }
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.status === 'SUBMITTED' || attempt.status === 'EXPIRED') {
      return res.status(400).json({ success: false, message: 'Assessment already finished' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + attempt.assessment.durationMinutes * 60 * 1000);

    const updated = await prisma.candidateAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'IN_PROGRESS',
        startTime: attempt.startTime || now,
        expiresAt: attempt.expiresAt || expiresAt
      }
    });

    // Initialize answer records for questions if not existing
    for (const q of attempt.assessment.questions) {
      const existingAns = await prisma.candidateAnswer.findUnique({
        where: { attemptId_questionId: { attemptId: attempt.id, questionId: q.id } }
      });

      if (!existingAns) {
        const starterCodes = JSON.parse(q.starterCodesJson || '{}');
        const defaultLang = attempt.assessment.allowedLanguages.split(',')[0] || 'python';
        const initialCode = starterCodes[defaultLang] || '';

        await prisma.candidateAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: q.id,
            code: initialCode,
            language: defaultLang,
            status: 'IN_PROGRESS'
          }
        });
      }
    }

    // Log start event
    await prisma.proctoringEvent.create({
      data: {
        attemptId: attempt.id,
        eventType: 'ASSESSMENT_STARTED',
        severity: 'INFO',
        detailsJson: JSON.stringify({
          time: now.toISOString(),
          durationMinutes: attempt.assessment.durationMinutes
        })
      }
    });

    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    return res.json({
      success: true,
      status: updated.status,
      startTime: updated.startTime,
      expiresAt: updated.expiresAt,
      remainingSeconds
    });
  } catch (error: any) {
    console.error('Start assessment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start assessment' });
  }
};

export const autosaveCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attemptId = req.user?.attemptId || req.user?.id;
    const { questionId, code, language, currentQuestionIndex } = req.body;

    if (!attemptId || !questionId) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const answer = await prisma.candidateAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId
        }
      },
      update: {
        code,
        language,
        autosavedAt: new Date()
      },
      create: {
        attemptId,
        questionId,
        code,
        language,
        status: 'IN_PROGRESS',
        autosavedAt: new Date()
      }
    });

    if (currentQuestionIndex !== undefined) {
      await prisma.candidateAttempt.update({
        where: { id: attemptId },
        data: { currentQuestionIndex: Number(currentQuestionIndex) }
      });
    }

    return res.json({
      success: true,
      savedAt: answer.autosavedAt,
      message: 'Code autosaved successfully'
    });
  } catch (error: any) {
    console.error('Autosave error:', error);
    return res.status(500).json({ success: false, message: 'Autosave failed' });
  }
};

export const submitAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attemptId = req.user?.attemptId || req.user?.id;
    const { answers: submittedAnswers } = req.body || {};

    let attempt = await prisma.candidateAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questions: {
              include: { testCases: true }
            }
          }
        },
        answers: true
      }
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.status === 'SUBMITTED') {
      return res.status(400).json({ success: false, message: 'Assessment has already been submitted.' });
    }

    // If answers map was sent in the submit request, upsert all of them immediately
    if (submittedAnswers && typeof submittedAnswers === 'object') {
      for (const questionId of Object.keys(submittedAnswers)) {
        const item = submittedAnswers[questionId];
        if (item && typeof item === 'object') {
          await prisma.candidateAnswer.upsert({
            where: {
              attemptId_questionId: {
                attemptId: attempt.id,
                questionId
              }
            },
            update: {
              code: item.code || '',
              language: item.language || 'python',
              autosavedAt: new Date()
            },
            create: {
              attemptId: attempt.id,
              questionId,
              code: item.code || '',
              language: item.language || 'python',
              status: 'IN_PROGRESS',
              autosavedAt: new Date()
            }
          });
        }
      }

      // Reload attempt with newly saved answers
      attempt = (await prisma.candidateAttempt.findUnique({
        where: { id: attemptId },
        include: {
          assessment: {
            include: {
              questions: {
                include: { testCases: true }
              }
            }
          },
          answers: true
        }
      })) || attempt;
    }

    // Comprehensive Server-side re-evaluation across all questions and test cases
    let totalScore = 0;
    let passedQuestionsCount = 0;

    for (const question of attempt.assessment.questions) {
      const answer = attempt.answers.find(a => a.questionId === question.id);
      const code = answer?.code?.trim() || '';
      const language = answer?.language || 'python';

      if (code.length > 0) {
        if (question.testCases && question.testCases.length > 0) {
          // Execute against test cases
          const execRes = await CodeRunnerService.execute(
            language,
            code,
            question.testCases
          );

          const questionScore = Math.round((execRes.passed / question.testCases.length) * question.points);
          totalScore += questionScore;

          const isPassed = execRes.passed === question.testCases.length;
          if (isPassed) passedQuestionsCount++;

          if (answer) {
            await prisma.candidateAnswer.update({
              where: { id: answer.id },
              data: {
                score: questionScore,
                status: isPassed ? 'PASSED' : 'FAILED',
                testCasesPassed: execRes.passed,
                testCasesTotal: question.testCases.length,
                executionTime: execRes.executionTime,
                memoryUsage: execRes.memoryUsage,
                submittedAt: new Date()
              }
            });
          }
        } else {
          // No predefined test cases: run code once to ensure no syntax/runtime errors
          const execRes = await CodeRunnerService.execute(
            language,
            code,
            [{ input: '', expectedOutput: '', isHidden: false }]
          );

          const isPassed = execRes.status === 'SUCCESS';
          const questionScore = isPassed ? question.points : Math.round(question.points * 0.5);
          totalScore += questionScore;
          if (isPassed) passedQuestionsCount++;

          if (answer) {
            await prisma.candidateAnswer.update({
              where: { id: answer.id },
              data: {
                score: questionScore,
                status: isPassed ? 'PASSED' : 'FAILED',
                testCasesPassed: isPassed ? 1 : 0,
                testCasesTotal: 1,
                executionTime: execRes.executionTime,
                memoryUsage: execRes.memoryUsage,
                submittedAt: new Date()
              }
            });
          }
        }
      } else {
        // No code written for this question
        if (answer) {
          await prisma.candidateAnswer.update({
            where: { id: answer.id },
            data: {
              score: 0,
              status: 'FAILED',
              testCasesPassed: 0,
              testCasesTotal: question.testCases?.length || 1,
              submittedAt: new Date()
            }
          });
        }
      }
    }

    const now = new Date();
    const finalAttempt = await prisma.candidateAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: now,
        score: totalScore,
        passedQuestions: passedQuestionsCount,
        totalQuestions: attempt.assessment.questions.length
      }
    });

    // Log proctoring event
    await prisma.proctoringEvent.create({
      data: {
        attemptId: attempt.id,
        eventType: 'ASSESSMENT_SUBMITTED',
        severity: 'INFO',
        detailsJson: JSON.stringify({
          submittedAt: now.toISOString(),
          score: totalScore,
          passed: passedQuestionsCount,
          total: attempt.assessment.questions.length
        })
      }
    }).catch(() => {});

    return res.json({
      success: true,
      message: 'Assessment Submitted Successfully',
      attempt: {
        candidateName: finalAttempt.candidateName,
        assessmentTitle: attempt.assessment.title,
        submittedAt: finalAttempt.submittedAt,
        score: finalAttempt.score,
        passedQuestions: finalAttempt.passedQuestions,
        totalQuestions: finalAttempt.totalQuestions,
        status: finalAttempt.status
      }
    });
  } catch (error: any) {
    console.error('Submit assessment error:', error);
    return res.status(500).json({ success: false, message: 'Submission failed: ' + (error.message || 'Server error') });
  }
};

export const updateSystemCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attemptId = req.user?.attemptId || req.user?.id;
    const { cameraStatus, micStatus } = req.body;

    await prisma.candidateAttempt.update({
      where: { id: attemptId },
      data: {
        ...(cameraStatus && { cameraStatus }),
        ...(micStatus && { micStatus })
      }
    });

    return res.json({ success: true, message: 'System check updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update system check' });
  }
};

export const getMyResults = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const candidateEmail = req.user?.email;
    if (!candidateEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const attempts = await prisma.candidateAttempt.findMany({
      where: { candidateEmail: candidateEmail.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            code: true,
            durationMinutes: true,
            passingScore: true,
            allowedLanguages: true
          }
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            score: true,
            status: true,
            language: true,
            testCasesPassed: true,
            testCasesTotal: true,
            executionTime: true
          }
        }
      }
    });

    const completed = attempts.filter(a => a.status === 'SUBMITTED' || a.status === 'EXPIRED');
    const passed = completed.filter(a => a.score >= (a.assessment?.passingScore || 70));
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((acc, a) => acc + a.score, 0) / completed.length)
      : 0;

    let totalDurationMinutes = 0;
    let durationCount = 0;
    completed.forEach(a => {
      if (a.startTime && a.submittedAt) {
        const diffMins = Math.round((new Date(a.submittedAt).getTime() - new Date(a.startTime).getTime()) / 60000);
        if (diffMins > 0) {
          totalDurationMinutes += diffMins;
          durationCount++;
        }
      }
    });
    const avgDuration = durationCount > 0 ? `${Math.round(totalDurationMinutes / durationCount)}m` : '—';

    return res.json({
      success: true,
      stats: {
        testsTaken: completed.length,
        testsPassed: passed.length,
        avgScore: completed.length > 0 ? `${avgScore}%` : '—',
        avgDuration
      },
      attempts: attempts.map(a => ({
        id: a.id,
        assessmentTitle: a.assessment?.title || 'Assessment',
        assessmentCode: a.accessCode,
        status: a.status,
        score: a.score,
        passingScore: a.assessment?.passingScore || 70,
        isPassed: a.score >= (a.assessment?.passingScore || 70) && a.status === 'SUBMITTED',
        passedQuestions: a.passedQuestions,
        totalQuestions: a.totalQuestions,
        startTime: a.startTime,
        submittedAt: a.submittedAt,
        durationMinutes: a.assessment?.durationMinutes,
        answersCount: a.answers.length
      }))
    });
  } catch (error: any) {
    console.error('getMyResults error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch candidate results' });
  }
};

export const exitToDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const email = user?.email;
    const name = user?.name;
    if (!user || !email) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const account = await prisma.candidateAccount.findUnique({ where: { email: email.toLowerCase() } });
    const fallbackUserId = user.id;
    const token = jwt.sign(
      {
        id: account?.id || fallbackUserId,
        email: email.toLowerCase(),
        name: name || account?.name || 'Student',
        role: 'CANDIDATE',
        accountId: account?.id || fallbackUserId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: account?.id || fallbackUserId,
        email: email.toLowerCase(),
        name: name || account?.name || 'Student',
        role: 'CANDIDATE',
        accountId: account?.id || fallbackUserId
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to switch to dashboard session' });
  }
};
