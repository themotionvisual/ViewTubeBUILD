import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary] Crash detected in ${this.props.componentName || 'a component'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Neo-Brutalist Crash Card
            return (
                <div className="bg-[#ff3399]/10 border-[4px] border-[#ff3399] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#ff3399] flex flex-col items-center justify-center text-center m-4 w-full max-w-md mx-auto">
                    <AlertTriangle size={48} className="text-[#ff3399] mb-4" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-black mb-2">Module Offline</h3>
                    <p className="font-bold text-black/60 text-sm mb-4">
                        {this.props.componentName ? `The ${this.props.componentName} visualization` : 'This component'} encountered an unexpected data anomaly.
                    </p>
                    <pre className="bg-black text-[#ff3399] p-4 rounded-xl text-[10px] text-left overflow-auto w-full font-mono border-2 border-black max-h-32">
                        {this.state.error?.message || 'Unknown error code'}
                    </pre>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-black uppercase text-sm border-[3px] border-black shadow-[4px_4px_0px_0px_black] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all"
                    >
                        Attempt Reboot
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}