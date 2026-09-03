import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    void _error;
    void _errorInfo;
    // No remote logging in contest build. Keep details out of user-visible output.
  }

  private readonly handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography component="h1" variant="h1">
            Mend
          </Typography>
          <Alert severity="error" variant="outlined">
            Something went wrong while rendering this page. Your local data is still stored in this
            browser unless you choose reset.
          </Alert>
          <Button type="button" variant="contained" onClick={this.handleReload}>
            Reload page
          </Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}
