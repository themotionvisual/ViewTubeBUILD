import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface GeminiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isValidating: boolean;
  validateAndSaveKey: (key: string) => Promise<boolean>;
  validationError: string | null;
}

const GeminiKeyContext = createContext<GeminiKeyContextType | undefined>(undefined);

export const GeminiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('vt_gemini_api_key');
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem('vt_gemini_api_key', key);
    setApiKeyState(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('vt_gemini_api_key');
    setApiKeyState(null);
  };

  const validateAndSaveKey = async (key: string): Promise<boolean> => {
    setIsValidating(true);
    setValidationError(null);
    try {
      // Validate by making a tiny request
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: 'reply with exactly "OK"',
      });

      if (response.text) {
        setApiKey(key);
        setIsValidating(false);
        return true;
      }
      throw new Error("Invalid response from Gemini");
    } catch (error: any) {
      console.error('Gemini API Key validation failed:', error);
      setValidationError(error.message || 'Failed to validate API key. Please check the key and try again.');
      setIsValidating(false);
      return false;
    }
  };

  return (
    <GeminiKeyContext.Provider value={{
      apiKey,
      setApiKey,
      clearApiKey,
      isValidating,
      validateAndSaveKey,
      validationError
    }}>
      {children}
    </GeminiKeyContext.Provider>
  );
};

export const useGeminiKey = () => {
  const context = useContext(GeminiKeyContext);
  if (context === undefined) {
    throw new Error('useGeminiKey must be used within a GeminiKeyProvider');
  }
  return context;
};
