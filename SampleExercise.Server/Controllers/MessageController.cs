using Microsoft.AspNetCore.Mvc;
using SampleExercise.Application.Interface;
using SampleExercise.Application.Model;
using SampleExercise.Server.Helper;

namespace SampleExercise.Server.Controllers;

[ApiController]
[Route("api/usermessages")]
public class UserMessagesController : ControllerBase
{
    private readonly IUserMessageRepository _messageRepository;

    public UserMessagesController(IUserMessageRepository messageRepository)
    {
        _messageRepository = messageRepository;
    }

    [HttpPost]
    public async Task<ActionResult<UserMessage>> CreateMessage([FromBody] UserMessageCreateDto messageDto)
    {
        if (messageDto == null)
        {
            return BadRequest("Message data is null.");
        }
        if (messageDto.SenderNumber <= 0 || messageDto.RecipientNumber <= 0)
        {
            return BadRequest("SenderNumber and RecipientNumber must be valid.");
        }
        if (messageDto.SenderNumber.ToString().Length < 10 || messageDto.RecipientNumber.ToString().Length < 10)
        {
            return BadRequest("SenderNumber and RecipientNumber must be at least 10 digits long.");
        }

        try
        {
            var createdMessage = await _messageRepository.CreateMessageAsync(messageDto);
            return CreatedAtAction(nameof(GetMessageById), new { id = createdMessage.Id }, createdMessage);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while creating the message. " + ex.Message);
        }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserMessage>>> GetMessages(
        [FromQuery] string messageFilter = null,
        [FromQuery] string sortBy = "SubmittedOn",
        [FromQuery] string sortOrder = "ASC",
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 1;
        if (pageSize > 100) pageSize = 100;

        var validSortFields = new[] { "SubmittedOn", "ModifiedOn" };
        if (!validSortFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest($"Invalid sortBy field. Allowed values are: {string.Join(", ", validSortFields)}.");
        }
        if (!sortOrder.Equals("ASC", StringComparison.OrdinalIgnoreCase) && !sortOrder.Equals("DESC", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Invalid sortOrder value. Allowed values are: ASC, DESC.");
        }

        try
        {
            var (messages, totalCount) = await _messageRepository.GetMessagesAsync(messageFilter, sortBy, sortOrder, pageNumber, pageSize);
            var pagedResult = new PagedResult<UserMessage>
            {
                Items = messages,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(pagedResult);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while retrieving messages. " + ex.Message);
        }
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<UserMessage>> GetMessageById(long id)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid message ID.");
        }
        try
        {
            var message = await _messageRepository.GetMessageByIdAsync(id);
            if (message == null)
            {
                return NotFound($"Message with ID {id} not found.");
            }
            return Ok(message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while retrieving the message. " + ex.Message);
        }
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> UpdateMessage(long id, [FromBody] string message)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid message ID.");
        }
        if (message == null)
        {
            return BadRequest("Message data is null.");
        }

        try
        {
            var existingMessage = await _messageRepository.GetMessageByIdAsync(id);
            if (existingMessage == null)
            {
                return NotFound($"Message with ID {id} not found for update.");
            }

            bool updated = await _messageRepository.UpdateMessageAsync(id, message);
            if (!updated)
            {
                return NotFound($"Message with ID {id} could not be updated or was not found.");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while updating the message. " + ex.Message);
        }
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteMessage(long id)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid message ID.");
        }
        try
        {
            var existingMessage = await _messageRepository.GetMessageByIdAsync(id);
            if (existingMessage == null)
            {
                return NotFound($"Message with ID {id} not found for deletion.");
            }

            bool deleted = await _messageRepository.DeleteMessageAsync(id);
            if (!deleted)
            {
                return NotFound($"Message with ID {id} could not be deleted or was not found.");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while deleting the message. " + ex.Message);
        }
    }
}
