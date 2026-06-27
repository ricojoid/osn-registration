using System.ComponentModel.DataAnnotations;

namespace OsnRegistration.Core.DTOs.Event;

public class EventRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime EventStartDate { get; set; }

    [Required]
    public DateTime EventEndDate { get; set; }

    [MaxLength(300)]
    public string Location { get; set; } = string.Empty;
}
