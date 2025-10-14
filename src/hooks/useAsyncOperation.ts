import { useState } from 'react';
import Toast from 'react-native-toast-message';

interface AsyncOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for handling async operations with loading states, error handling, and user feedback
 *
 * @example
 * const { loading, error, execute } = useAsyncOperation();
 *
 * const handleSave = async () => {
 *   const result = await execute(
 *     () => saveBudget(budget),
 *     { successMessage: 'Budget saved! 💾' }
 *   );
 *
 *   if (result) {
 *     navigation.goBack();
 *   }
 * };
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T>(
    operation: () => Promise<T>,
    options: AsyncOptions = {}
  ): Promise<T | null> => {
    const {
      successMessage,
      errorMessage = 'Something went wrong. Please try again.',
      onSuccess,
      onError,
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await operation();

      // Show success toast if message provided
      if (successMessage) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: successMessage,
          visibilityTime: 3000,
          position: 'bottom',
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (err) {
      // Extract error message
      const message = err instanceof Error ? err.message : errorMessage;
      setError(message);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
        visibilityTime: 4000,
        position: 'bottom',
      });

      // Call error callback if provided
      if (onError && err instanceof Error) {
        onError(err);
      }

      console.error('Operation failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Execute operation without showing any toasts (silent mode)
   */
  const executeSilent = async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      setError(message);
      console.error('Silent operation failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  return { loading, error, execute, executeSilent, clearError };
};

/**
 * Show a simple success toast
 */
export const showSuccessToast = (message: string, title: string = 'Success') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    visibilityTime: 3000,
    position: 'bottom',
  });
};

/**
 * Show a simple error toast
 */
export const showErrorToast = (message: string, title: string = 'Error') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    visibilityTime: 4000,
    position: 'bottom',
  });
};

/**
 * Show a simple info toast
 */
export const showInfoToast = (message: string, title: string = 'Info') => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    visibilityTime: 3000,
    position: 'bottom',
  });
};

/**
 * Show a warning toast
 */
export const showWarningToast = (message: string, title: string = 'Warning') => {
  Toast.show({
    type: 'error', // Using error type for warnings (can customize if needed)
    text1: title,
    text2: message,
    visibilityTime: 3500,
    position: 'bottom',
  });
};
