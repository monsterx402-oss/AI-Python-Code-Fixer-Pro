
export interface ErrorDetail {
  line: number;
  type: string;
  message: string;
}

export interface FixResult {
  correctedCode: string;
  explanation: string;
  errors: ErrorDetail[];
  lintingSuggestions: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalCode: string;
  result: FixResult;
}
