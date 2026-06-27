using OsnRegistration.Core.DTOs.Document;

namespace OsnRegistration.Core.DTOs.Registration;

public class RegistrationResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public bool HasVerificationLetter { get; set; }
    public List<DocumentResponse> Documents { get; set; } = new();
}
