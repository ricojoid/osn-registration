using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OsnRegistration.Core.Interfaces;

namespace OsnRegistration.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IFileService _fileService;

    public DocumentsController(IDocumentRepository documentRepository, IFileService fileService)
    {
        _documentRepository = documentRepository;
        _fileService = fileService;
    }

    /// <summary>
    /// Download a document file by ID. Admin only.
    /// </summary>
    [HttpGet("{id}/download")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Download(int id)
    {
        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null)
            return NotFound(new { message = "Dokumen tidak ditemukan." });

        var filePath = _fileService.GetFilePath(document.FilePath);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File tidak ditemukan di server." });

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(fileBytes, "application/pdf", document.FileName);
    }
}
