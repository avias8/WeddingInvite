import { Timestamp } from "firebase/firestore";

export interface Submission {
  id: string;
  imageUrl: string;
  storagePath: string;
  tableNumber: number;
  timestamp: Timestamp;
}

export interface Winner {
  submissionId: string;
  imageUrl: string;
  tableNumber: number;
}
