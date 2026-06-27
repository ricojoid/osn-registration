using System.ComponentModel.DataAnnotations;

namespace OsnRegistration.Core.Entities;

public class Event
{
    [Key]
    public int Id { get; set; }

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

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Open"; // "Open", "Closed", "Cancelled", "Postponed"

    [MaxLength(1000)]
    public string? CancellationReason { get; set; }

    [MaxLength(500)]
    public string? CancellationLetterPath { get; set; }

    [MaxLength(500)]
    public string? RescheduleLetterPath { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Registration deadline is automatically calculated as 7 days before EventStartDate.
    /// </summary>
    public DateTime RegistrationDeadline => EventStartDate.AddDays(-7);

    // Navigation property
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}
