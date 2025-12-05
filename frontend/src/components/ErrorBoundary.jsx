import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("UI Crash:", err, info); }

  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 24, color: "#b91c1c" }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.err?.message || this.state.err)}</pre>
          <p>Open DevTools → Console to see full stack.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
