import React, { useState } from 'react';
import { useGeminiKey } from '../context/GeminiKeyContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ExternalLink, KeyRound, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export const GeminiKeySettings: React.FC<{
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}> = ({ trigger, open, onOpenChange }) => {
  const { apiKey, clearApiKey, isValidating, validateAndSaveKey, validationError } = useGeminiKey();
  const [inputValue, setInputValue] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    const isSuccess = await validateAndSaveKey(inputValue.trim());
    if (isSuccess) {
      setSuccess(true);
      setInputValue('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-500" />
            Gemini AI Integrations
          </DialogTitle>
          <DialogDescription>
            Unlock powerful AI features on VIEWTube for free by bringing your own Google AI Studio API Key.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Instructions Block */}
          {!apiKey && (
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-4 text-sm space-y-3">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">How to get your free key:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-blue-800/80 dark:text-blue-200/80">
                <li>
                  Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3" /></a>
                </li>
                <li>Connect with your Google Account.</li>
                <li>Click the <strong>"Create API key"</strong> button.</li>
                <li>Copy the generated key and paste it below.</li>
              </ol>
            </div>
          )}

          {/* Key Management UI */}
          {apiKey ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">API Key is active</h4>
                  <p className="text-sm text-green-700/80 dark:text-green-300/80">Your key ends in ••••{apiKey.slice(-4)}</p>
                </div>
              </div>
              <Button variant="destructive" onClick={handleClear} className="w-full sm:w-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Your API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="AIzaSy..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              {validationError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationError}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key saved successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!apiKey && (
          <DialogFooter>
            <Button onClick={handleSave} disabled={isValidating || !inputValue.trim()}>
              {isValidating ? 'Validating...' : 'Save & Connect'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
