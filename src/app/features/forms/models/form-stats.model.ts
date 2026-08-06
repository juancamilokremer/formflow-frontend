export interface DailyResponseCount {
  date: string;
  count: number;
}

export interface OptionDistribution {
  optionId: string;
  label: string;
  count: number;
  percentage: number;
}

export interface MatrixCellStats {
  columnId: string;
  columnLabel: string;
  count: number;
  percentage: number;
}

export interface MatrixRowStats {
  rowId: string;
  rowLabel: string;
  cells: MatrixCellStats[];
}

export interface QuestionStats {
  questionId: string;
  title: string;
  type: string;
  totalResponses: number;
  answeredCount: number;
  distributions: OptionDistribution[] | null;
  average: number | null;
  median: number | null;
  npsScore: number | null;
  matrixRows: MatrixRowStats[] | null;
}

export interface FormStats {
  formId: string;
  formName: string;
  totalResponses: number;
  completionRate: number | null;
  avgResponseTimeSeconds: number | null;
  timeline: DailyResponseCount[];
  questions: QuestionStats[];
}
