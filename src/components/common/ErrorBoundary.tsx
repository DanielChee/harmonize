// Error Boundary Component
// Catches JavaScript errors anywhere in the component tree and displays a fallback UI

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log error to error tracking service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="error-outline" size={80} color={COLORS.error} />
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We&apos;re sorry for the inconvenience. The app encountered an unexpected error.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <MaterialIcons name="refresh" size={20} color={COLORS.text.inverse} />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              If the problem persists, please restart the app or contact support.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  errorStack: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.inverse,
  },
  helpText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
