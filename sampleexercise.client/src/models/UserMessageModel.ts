export interface UserMessage {
  id: number;
  senderNumber: number;
  recipientNumber: number;
  messageContent: string;
  status: string;
  submittedOn: string; // ISO 8601 date string
  modifiedOn: string; // ISO 8601 date string
}
