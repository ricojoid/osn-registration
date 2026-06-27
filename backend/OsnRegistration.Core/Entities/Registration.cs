using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OsnRegistration.Core.Entities;

public class Registration
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int EventId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // "Pending", "Verified", "Rejected"

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

    public DateTime? VerifiedAt { get; set; }

    [MaxLength(500)]
    public string? VerificationLetterPath { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [ForeignKey("EventId")]
    public Event Event { get; set; } = null!;

    public ICollection<Document> Documents { get; set; } = new List<Document>();
}
