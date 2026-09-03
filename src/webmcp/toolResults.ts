import type {
  CommandErrorCode,
  CommandFailure,
  CommandResult,
  CommandSuccess,
} from '../domain/types';

export type ToolResult<T> =
  | {
      ok: true;
      code: 'ok';
      message: string;
      data: T;
      uiStateVersion: number;
      nextSuggestedTools?: string[];
    }
  | {
      ok: false;
      code: CommandErrorCode;
      message: string;
      retryable: boolean;
      fieldErrors?: Record<string, string>;
      uiStateVersion: number;
    };

export function toToolSuccess<T>(params: {
  message: string;
  data: T;
  uiStateVersion: number;
  nextSuggestedTools?: string[];
}): ToolResult<T> {
  return {
    ok: true,
    code: 'ok',
    message: params.message,
    data: params.data,
    uiStateVersion: params.uiStateVersion,
    nextSuggestedTools: params.nextSuggestedTools,
  };
}

export function toToolFailure<T>(params: {
  code: CommandErrorCode;
  message: string;
  retryable: boolean;
  uiStateVersion: number;
  fieldErrors?: Record<string, string>;
}): ToolResult<T> {
  return {
    ok: false,
    code: params.code,
    message: params.message,
    retryable: params.retryable,
    fieldErrors: params.fieldErrors,
    uiStateVersion: params.uiStateVersion,
  };
}

export function fromCommandResult<T>(
  result: CommandResult<T>,
  nextSuggestedTools?: string[]
): ToolResult<T> {
  if (result.ok) {
    return fromCommandSuccess(result, nextSuggestedTools);
  }

  return fromCommandFailure(result);
}

function fromCommandSuccess<T>(
  result: CommandSuccess<T>,
  nextSuggestedTools?: string[]
): ToolResult<T> {
  return {
    ok: true,
    code: 'ok',
    message: result.message,
    data: result.data,
    uiStateVersion: result.uiStateVersion,
    nextSuggestedTools,
  };
}

function fromCommandFailure<T>(result: CommandFailure): ToolResult<T> {
  return {
    ok: false,
    code: result.code,
    message: result.message,
    retryable: result.retryable,
    fieldErrors: result.fieldErrors,
    uiStateVersion: result.uiStateVersion,
  };
}
