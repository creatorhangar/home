import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch() {}
  handleRetry = () => {
    this.setState({ hasError: false })
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-text-primary mb-4">Ocorreu um erro. Tente novamente.</p>
            <button className="px-4 py-2 bg-accent-primary text-white rounded" onClick={this.handleRetry}>Tentar novamente</button>
          </div>
        </div>
      )
    }
    return this.props.children as React.ReactElement
  }
}