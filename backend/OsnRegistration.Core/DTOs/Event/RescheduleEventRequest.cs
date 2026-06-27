using System.ComponentModel.DataAnnotations;

namespace OsnRegistration.Core.DTOs.Event;

public class RescheduleEventRequest
{
    [Required]
    public DateTime EventStartDate { get; set; }

    [Required]
    public DateTime EventEndDate { get; set; }
}
