import type { PagedResult } from "../models/PagedResult";
import type { UserMessageCreateDto } from "../models/UserMessageCreateDto";
import type { UserMessage } from "../models/UserMessageModel";

const API_BASE_URL = "/api/usermessages";

export async function createUserMessage(
  messageDto: UserMessageCreateDto
): Promise<UserMessage> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(messageDto),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create message: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  return (await response.json()) as UserMessage;
}

export interface GetMessagesParams {
  messageFilter?: string;
  sortBy?: "Id" | "MessageContent" | "SubmittedOn" | "ModifiedOn";
  sortOrder?: "ASC" | "DESC";
  pageNumber?: number;
  pageSize?: number;
}

export async function getMessages(
  params: GetMessagesParams = {}
): Promise<PagedResult<UserMessage>> {
  const queryParams = new URLSearchParams();
  if (params.messageFilter)
    queryParams.append("messageFilter", params.messageFilter);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.pageNumber !== undefined)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params.pageSize !== undefined)
    queryParams.append("pageSize", params.pageSize.toString());

  const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get messages: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  return (await response.json()) as PagedResult<UserMessage>;
}

export async function getMessageById(id: number): Promise<UserMessage> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Message with ID ${id} not found.`);
    }
    const errorText = await response.text();
    throw new Error(
      `Failed to get message by ID ${id}: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  return (await response.json()) as UserMessage;
}

export async function updateMessage(
  id: number,
  messageContent: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageContent),
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Message with ID ${id} not found for update.`);
    }
    const errorText = await response.text();
    throw new Error(
      `Failed to update message ${id}: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
}

export async function deleteMessage(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Message with ID ${id} not found for deletion.`);
    }
    const errorText = await response.text();
    throw new Error(
      `Failed to delete message ${id}: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
}
