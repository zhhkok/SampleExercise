using SampleExercise.Application.Model;

namespace SampleExercise.Application.Interface;

public interface IUserMessageRepository
{
    Task<UserMessage> CreateMessageAsync(UserMessageCreateDto messageDto);
    Task<UserMessage> GetMessageByIdAsync(long id);
    Task<(IEnumerable<UserMessage> Messages, int TotalCount)> GetMessagesAsync(
        string messageFilter = null,
        string sortBy = "SubmittedOn",
        string sortOrder = "ASC",
        int pageNumber = 1,
        int pageSize = 10);
    Task<bool> UpdateMessageAsync(long id, string message);
    Task<bool> DeleteMessageAsync(long id);
}