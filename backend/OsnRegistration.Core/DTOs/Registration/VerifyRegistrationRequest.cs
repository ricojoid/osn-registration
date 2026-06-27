namespace OsnRegistration.Core.DTOs.Registration;

public class VerifyRegistrationRequest
{
    public string Status { get; set; } = string.Empty; // "Verified" or "Rejected"
}
