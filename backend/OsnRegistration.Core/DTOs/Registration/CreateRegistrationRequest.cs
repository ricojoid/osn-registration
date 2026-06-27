using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace OsnRegistration.Core.DTOs.Registration;

public class CreateRegistrationRequest
{
    [Required]
    public int EventId { get; set; }

    [Required]
    public IFormFile KartuPelajar { get; set; } = null!;

    [Required]
    public IFormFile KartuKeluarga { get; set; } = null!;

    [Required]
    public IFormFile SuratKeteranganSehat { get; set; } = null!;
}
