namespace OsnRegistration.Core.DTOs.Document;

public class DocumentResponse
{
    public int Id { get; set; }
    public int RegistrationId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}
