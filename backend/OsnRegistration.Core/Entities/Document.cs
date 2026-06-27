using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OsnRegistration.Core.Entities;

public class Document
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int RegistrationId { get; set; }

    [Required]
    [MaxLength(50)]
    public string DocumentType { get; set; } = string.Empty; // "KartuPelajar", "KartuKeluarga", "SuratKeteranganSehat"

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("RegistrationId")]
    public Registration Registration { get; set; } = null!;
}
