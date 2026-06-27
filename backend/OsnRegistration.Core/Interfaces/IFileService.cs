using Microsoft.AspNetCore.Http;

namespace OsnRegistration.Core.Interfaces;

public interface IFileService
{
    /// <summary>
    /// Saves an uploaded file to the server.
    /// Only .pdf files are accepted.
    /// </summary>
    /// <param name="file">The uploaded file</param>
    /// <param name="subFolder">Sub-folder to organize files (e.g., registrationId)</param>
    /// <returns>Tuple of (FileName, FilePath)</returns>
    Task<(string FileName, string FilePath)> SaveFileAsync(IFormFile file, string subFolder);

    /// <summary>
    /// Gets the full file path for downloading.
    /// </summary>
    string GetFilePath(string relativePath);

    /// <summary>
    /// Validates that the file is a PDF.
    /// </summary>
    bool IsValidPdf(IFormFile file);
}
