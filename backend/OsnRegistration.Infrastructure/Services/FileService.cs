using Microsoft.AspNetCore.Http;
using OsnRegistration.Core.Interfaces;

namespace OsnRegistration.Infrastructure.Services;

public class FileService : IFileService
{
    private readonly string _uploadPath;

    public FileService(string uploadPath)
    {
        _uploadPath = uploadPath;

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<(string FileName, string FilePath)> SaveFileAsync(IFormFile file, string subFolder)
    {
        if (!IsValidPdf(file))
        {
            throw new InvalidOperationException("Hanya file dengan ekstensi .pdf yang diperbolehkan.");
        }

        var folderPath = Path.Combine(_uploadPath, subFolder);
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        // Generate unique file name to prevent overwrites
        var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(folderPath, uniqueFileName);
        var relativePath = Path.Combine(subFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return (file.FileName, relativePath);
    }

    public string GetFilePath(string relativePath)
    {
        return Path.Combine(_uploadPath, relativePath);
    }

    public bool IsValidPdf(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        // Check file extension
        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        if (extension != ".pdf")
            return false;

        // Check MIME type
        if (file.ContentType?.ToLowerInvariant() != "application/pdf")
            return false;

        return true;
    }
}
