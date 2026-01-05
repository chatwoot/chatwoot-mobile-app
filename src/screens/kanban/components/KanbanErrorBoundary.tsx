import { tailwind } from '@/theme';
import { logger } from '@/utils/logger';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class KanbanErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[KanbanErrorBoundary] Error caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={tailwind.style('flex-1 items-center justify-center p-4')}>
          <Text style={tailwind.style('text-red-600 text-center mb-2')}>
            Ocorreu um erro ao carregar o Kanban
          </Text>
          <Text style={tailwind.style('text-gray-500 text-sm text-center mb-4')}>
            {this.state.error?.message || 'Erro desconhecido'}
          </Text>
          <Pressable
            onPress={this.resetError}
            style={tailwind.style('px-4 py-2 bg-blue-600 rounded-lg')}>
            <Text style={tailwind.style('text-white font-inter-medium-24')}>Tentar Novamente</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

