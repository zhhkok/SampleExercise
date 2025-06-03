namespace SampleExercise.Application.Model;

public class UserMessage // Renamed to align with table name
{
    public long Id { get; set; }
    public long SenderNumber { get; set; }
    public long RecipientNumber { get; set; }
    public string MessageContent { get; set; }
    public string Status { get; set; }
    public DateTime SubmittedOn { get; set; }
    public DateTime ModifiedOn { get; set; }
}