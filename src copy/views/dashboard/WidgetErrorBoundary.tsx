import React from "react"

type Props = {
  widgetId: string
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

export class WidgetErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(`[WidgetErrorBoundary] ${this.props.widgetId} crashed`, error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full border-[3px] border-black rounded-[12px] bg-white p-3 shadow-[3px_3px_0_0_#000]">
          <div className="text-[11px] font-black uppercase tracking-wider">Widget Error</div>
          <div className="mt-2 text-[10px] font-bold opacity-70">
            This widget failed to render and was isolated so the dashboard can continue running.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

