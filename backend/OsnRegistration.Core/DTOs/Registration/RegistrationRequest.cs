using System.ComponentModel.DataAnnotations;

namespace OsnRegistration.Core.DTOs.Registration;

public class RegistrationRequest
{
    [Required]
    public int EventId { get; set; }
}
