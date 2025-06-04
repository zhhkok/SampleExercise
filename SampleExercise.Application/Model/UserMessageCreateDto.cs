namespace SampleExercise.Application.Model;

public class UserMessageCreateDto
{
    public long SenderNumber { get; set; }
    public long RecipientNumber { get; set; }
    public string MessageContent { get; set; }
}
