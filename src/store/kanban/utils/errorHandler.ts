import { AxiosError } from 'axios';

interface KanbanApiError {
  message: string;
  status?: number;
  code?: string;
}

export function handleKanbanError(error: unknown): KanbanApiError {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;

  if (axiosError.response?.status === 401) {
    return {
      message: 'Por favor, conecte um token para poder espelhar os seus dados no app',
      status: 401,
    };
  }

  const errorMessage =
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.message ||
    'Erro ao processar solicitação';

  return {
    message: errorMessage,
    status: axiosError.response?.status,
    code: axiosError.code,
  };
}
