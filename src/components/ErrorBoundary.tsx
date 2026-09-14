import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
  }

  private handleReload = () => {
    try {
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      sessionStorage.clear();
    } catch (e) {}
    window.location.replace(
      window.location.origin + window.location.pathname + "?v=" + Date.now()
    );
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 z-50 select-none">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-3">
              ⚡
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Update Ready</h2>
            <p className="text-xs text-slate-400 mb-4">
              A newer version of Rocket League 2D has been deployed. Tap below to reload.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl transition shadow-lg cursor-pointer"
            >
              Reload Latest Version
            </button>
            {this.state.error && (
              <p className="mt-3 text-[10px] font-mono text-slate-500 max-w-full truncate">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
