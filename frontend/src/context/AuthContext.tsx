import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Assessment, CandidateAttempt } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  candidateAttempt: CandidateAttempt | null;
  currentAssessment: Assessment | null;
  loading: boolean;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginCandidate: (name: string, email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setCandidateAttempt: React.Dispatch<React.SetStateAction<CandidateAttempt | null>>;
  setCurrentAssessment: React.Dispatch<React.SetStateAction<Assessment | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('devexam_token'));
  const [candidateAttempt, setCandidateAttempt] = useState<CandidateAttempt | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('devexam_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            if (res.attempt) setCandidateAttempt(res.attempt);
          } else {
            localStorage.removeItem('devexam_token');
            setToken(null);
          }
        } catch {
          localStorage.removeItem('devexam_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginAdmin = async (email: string, pass: string) => {
    try {
      const res = await api.loginAdmin(email, pass);
      if (res.success) {
        localStorage.setItem('devexam_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const loginCandidate = async (name: string, email: string, code: string) => {
    try {
      const res = await api.loginCandidate(name, email, code);
      if (res.success) {
        localStorage.setItem('devexam_token', res.token);
        setToken(res.token);
        setUser({
          id: res.attempt.id,
          name: res.attempt.candidateName,
          email: res.attempt.candidateEmail,
          role: 'CANDIDATE',
          attemptId: res.attempt.id
        });
        setCandidateAttempt(res.attempt);
        setCurrentAssessment(res.assessment);
        return { success: true };
      }
      return { success: false, message: res.message || 'Access code invalid' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('devexam_token');
    setToken(null);
    setUser(null);
    setCandidateAttempt(null);
    setCurrentAssessment(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        candidateAttempt,
        currentAssessment,
        loading,
        loginAdmin,
        loginCandidate,
        logout,
        setCandidateAttempt,
        setCurrentAssessment
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
