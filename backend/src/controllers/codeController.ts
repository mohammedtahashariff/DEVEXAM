import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { CodeRunnerService, TestCaseInput } from '../services/codeRunner.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const runCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { language, code, questionId, customInput, testCases } = req.body;

    if (!language || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Language and code are required' });
    }

    let casesToRun: TestCaseInput[] = [];

    if (customInput !== undefined && customInput !== null && customInput.trim() !== '') {
      casesToRun = [
        {
          input: customInput,
          expectedOutput: '',
          isHidden: false
        }
      ];
    } else if (Array.isArray(testCases) && testCases.length > 0) {
      casesToRun = testCases.map((tc: any, index: number) => ({
        id: tc.id || `tc-${index}`,
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        isHidden: Boolean(tc.isHidden)
      }));
    } else if (questionId) {
      // Fetch sample test cases from DB
      const dbTestCases = await prisma.testCase.findMany({
        where: { questionId, isHidden: false }
      });
      casesToRun = dbTestCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: false
      }));
    }

    if (casesToRun.length === 0) {
      casesToRun = [{ input: '', expectedOutput: '', isHidden: false }];
    }

    const executionResult = await CodeRunnerService.execute(language, code, casesToRun);

    // If request has attemptId, log a CODE_RUN event
    if (req.user?.attemptId) {
      await prisma.proctoringEvent.create({
        data: {
          attemptId: req.user.attemptId,
          eventType: 'CODE_RUN',
          severity: 'INFO',
          questionId: questionId || null,
          detailsJson: JSON.stringify({
            language,
            passed: executionResult.passed,
            failed: executionResult.failed,
            executionTime: executionResult.executionTime
          })
        }
      }).catch(() => {}); // non-blocking
    }

    return res.json({
      success: true,
      ...executionResult
    });
  } catch (error: any) {
    console.error('Code execution error:', error);
    return res.status(500).json({
      success: false,
      status: 'RUNTIME_ERROR',
      message: error.message || 'Code execution failed',
      results: []
    });
  }
};
