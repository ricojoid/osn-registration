using System.ComponentModel.DataAnnotations;

namespace OsnRegistration.Core.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = "Pendaftar"; // "Admin" or "Pendaftar"

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
