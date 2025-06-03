using Dapper;
using Microsoft.Data.SqlClient;
using SampleExercise.Application.Interface;
using SampleExercise.Application.Model;
using System.Data;
using System.Text;

namespace SampleExercise.Infrastructure.Repository;

public class UserMessageRepository : IUserMessageRepository
{
    private readonly string _connectionString;

    public UserMessageRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    private IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }

    public async Task<UserMessage> CreateMessageAsync(UserMessageCreateDto messageDto)
    {
        var now = DateTime.UtcNow;
        string sql = @"
            INSERT INTO UserMessages (SenderNumber, RecipientNumber, MessageContent, Status, SubmittedOn, ModifiedOn)
            OUTPUT INSERTED.*
            VALUES (@SenderNumber, @RecipientNumber, @MessageContent, @Status, @SubmittedOn, @ModifiedOn);";

        using (var connection = CreateConnection())
        {
            var newMessage = new
            {
                messageDto.SenderNumber,
                messageDto.RecipientNumber,
                messageDto.MessageContent,
                messageDto.Status,
                SubmittedOn = now,
                ModifiedOn = now
            };
            return await connection.QuerySingleAsync<UserMessage>(sql, newMessage);
        }
    }

    public async Task<UserMessage> GetMessageByIdAsync(long id)
    {
        string sql = "SELECT * FROM UserMessages WHERE Id = @Id;";
        using (var connection = CreateConnection())
        {
            return await connection.QuerySingleOrDefaultAsync<UserMessage>(sql, new { Id = id });
        }
    }

    public async Task<(IEnumerable<UserMessage> Messages, int TotalCount)> GetMessagesAsync(
        string messageFilter = null,
        string sortBy = "SubmittedOn",
        string sortOrder = "ASC",
        int pageNumber = 1,
        int pageSize = 10)
    {
        var parameters = new DynamicParameters();
        var queryBuilder = new StringBuilder();
        var countQueryBuilder = new StringBuilder();

        queryBuilder.Append("SELECT * ");
        countQueryBuilder.Append("SELECT COUNT(*) ");

        var fromAndWhereBuilder = new StringBuilder("FROM UserMessages WHERE 1=1 "); // Start with a benign WHERE clause

        if (!string.IsNullOrWhiteSpace(messageFilter))
        {
            fromAndWhereBuilder.Append("AND MessageContent LIKE @MessageFilter ");
            parameters.Add("MessageFilter", $"%{messageFilter}%");
        }

        countQueryBuilder.Append(fromAndWhereBuilder.ToString());

        // Validate sortBy and sortOrder to prevent SQL injection if directly concatenating
        // (though here we are selecting from predefined valid fields)
        string orderByClause;
        string validatedSortBy = sortBy.Equals("ModifiedOn", StringComparison.OrdinalIgnoreCase) ? "ModifiedOn" : "SubmittedOn"; // Default to SubmittedOn
        string validatedSortOrder = sortOrder.Equals("DESC", StringComparison.OrdinalIgnoreCase) ? "DESC" : "ASC"; // Default to ASC

        orderByClause = $"ORDER BY {validatedSortBy} {validatedSortOrder} ";

        queryBuilder.Append(fromAndWhereBuilder.ToString());
        queryBuilder.Append(orderByClause);
        queryBuilder.Append("OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;");

        parameters.Add("Offset", (pageNumber - 1) * pageSize);
        parameters.Add("PageSize", pageSize);

        using (var connection = CreateConnection())
        {
            var messages = await connection.QueryAsync<UserMessage>(queryBuilder.ToString(), parameters);
            var totalCount = await connection.ExecuteScalarAsync<int>(countQueryBuilder.ToString(), parameters); // Reuse parameters that apply
            return (messages, totalCount);
        }
    }

    public async Task<bool> UpdateMessageAsync(long id, string message)
    {
        var now = DateTime.UtcNow;

        string sql = @"
            UPDATE UserMessages 
            SET MessageContent = @MessageContent, ModifiedOn = @ModifiedOn 
            WHERE Id = @Id;";

        using (var connection = CreateConnection())
        {
            var affectedRows = await connection.ExecuteAsync(sql, new { MessageContent = message, ModifiedOn = now, Id = id });
            return affectedRows > 0;
        }
    }

    public async Task<bool> DeleteMessageAsync(long id)
    {
        string sql = "DELETE FROM UserMessages WHERE Id = @Id;";
        using (var connection = CreateConnection())
        {
            var affectedRows = await connection.ExecuteAsync(sql, new { Id = id });
            return affectedRows > 0;
        }
    }

}
