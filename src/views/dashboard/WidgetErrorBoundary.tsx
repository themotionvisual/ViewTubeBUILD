import React from "react"
import { WidgetStatePanel } from "./WidgetPrimitives"

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

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <WidgetStatePanel
          state={{
            status: "error",
            data: null,
            message: "This widget failed to render. The rest of the dashboard is still available.",
            recoveryAction: "Try widget again",
          }}
          onRecover={this.handleRetry}
        />
      )
    }
    return this.props.children
  }
}
