using System.ComponentModel.DataAnnotations;

namespace OsnRegistration.Core.DTOs.Event;

public class CancelEventRequest
{
    /// <summary>
    /// Type of cancellation: "Cancelled" or "Postponed"
    /// </summary>
    [Required]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Reason for cancellation or postponement
    /// </summary>
    [Required]
    [MaxLength(1000)]
    public string Reason { get; set; } = string.Empty;
}
