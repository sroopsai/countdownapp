export interface CountdownEvent {
  id: string;
  title: string;
  targetDate: string; // ISO 8601 string
  createdAt: string;
  notes?: string;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
  totalMs: number;
}
