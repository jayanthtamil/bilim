import React, { Component, ErrorInfo } from "react";

interface CompState {
  hasError: boolean;
}

class BlmErrorBoundary extends Component<{}, CompState> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default BlmErrorBoundary;
