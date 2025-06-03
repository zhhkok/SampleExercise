import type { PagedResult } from "../models/PagedResult";
import type { UserMessageCreateDto } from "../models/UserMessageCreateDto";
import type { UserMessage } from "../models/UserMessageModel";

const API_BASE_URL = "/api/usermessages";

/**
 * Creates a new user message.
 * Corresponds to SampleExercise.Server.Controllers.UserMessagesController.CreateMessage
 * @param messageDto The message data.
 * @returns The created user message.
 */
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

/**
 * Parameters for fetching messages.
 */
export interface GetMessagesParams {
  messageFilter?: string;
  sortBy?: "SubmittedOn" | "ModifiedOn";
  sortOrder?: "ASC" | "DESC";
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Retrieves a paginated list of user messages.
 * Corresponds to SampleExercise.Server.Controllers.UserMessagesController.GetMessages
 * @param params Filtering, sorting, and pagination parameters.
 * @returns A paged result of user messages.
 */
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

/**
 * Retrieves a specific user message by its ID.
 * Corresponds to SampleExercise.Server.Controllers.UserMessagesController.GetMessageById
 * @param id The ID of the message.
 * @returns The user message.
 */
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

/**
 * Updates an existing user message.
 * Corresponds to SampleExercise.Server.Controllers.UserMessagesController.UpdateMessage
 * @param id The ID of the message to update.
 * @param messageContent The new content for the message.
 */
export async function updateMessage(
  id: number,
  messageContent: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageContent), // ASP.NET Core [FromBody] string expects a JSON string literal
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

/**
 * Deletes a user message by its ID.
 * Corresponds to SampleExercise.Server.Controllers.UserMessagesController.DeleteMessage
 * @param id The ID of the message to delete.
 */
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
