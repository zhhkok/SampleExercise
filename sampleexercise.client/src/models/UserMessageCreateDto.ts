export interface UserMessageCreateDto {
  senderNumber: number;
  recipientNumber: number;
  messageContent: string;
  status: string;
}
