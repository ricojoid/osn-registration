using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OsnRegistration.Core.DTOs.Document;
using OsnRegistration.Core.DTOs.Registration;
using OsnRegistration.Core.Entities;
using OsnRegistration.Core.Interfaces;

namespace OsnRegistration.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegistrationsController : ControllerBase
{
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IDocumentRepository _documentRepository;
    private readonly IFileService _fileService;
    private readonly IUserRepository _userRepository;
    private readonly IPdfService _pdfService;

    public RegistrationsController(
        IRegistrationRepository registrationRepository,
        IEventRepository eventRepository,
        IDocumentRepository documentRepository,
        IFileService fileService,
        IUserRepository userRepository,
        IPdfService pdfService)
    {
        _registrationRepository = registrationRepository;
        _eventRepository = eventRepository;
        _documentRepository = documentRepository;
        _fileService = fileService;
        _userRepository = userRepository;
        _pdfService = pdfService;
    }

    /// <summary>
    /// Get all registrations. Admin only.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<RegistrationResponse>>> GetAll()
    {
        var registrations = await _registrationRepository.GetAllAsync();
        return Ok(registrations.Select(MapToResponse));
    }

    /// <summary>
    /// Get registrations by event. Admin only.
    /// </summary>
    [HttpGet("event/{eventId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<RegistrationResponse>>> GetByEvent(int eventId)
    {
        var registrations = await _registrationRepository.GetByEventIdAsync(eventId);
        return Ok(registrations.Select(MapToResponse));
    }

    /// <summary>
    /// Get current user's registrations. Pendaftar only.
    /// </summary>
    [HttpGet("my")]
    [Authorize(Roles = "Pendaftar")]
    public async Task<ActionResult<IEnumerable<RegistrationResponse>>> GetMyRegistrations()
    {
        var userId = GetCurrentUserId();
        var registrations = await _registrationRepository.GetByUserIdAsync(userId);
        return Ok(registrations.Select(MapToResponse));
    }

    /// <summary>
    /// Register for an event with 3 PDF documents. Pendaftar only.
    /// Business rule: Registration is rejected if current time is past EventStartDate - 7 days.
    /// Required documents: KartuPelajar, KartuKeluarga, SuratKeteranganSehat (all PDF).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Pendaftar")]
    public async Task<ActionResult<RegistrationResponse>> Create(
        [FromForm] CreateRegistrationRequest request)
    {
        var userId = GetCurrentUserId();

        // Check event exists
        var eventEntity = await _eventRepository.GetByIdAsync(request.EventId);
        if (eventEntity == null)
            return NotFound(new { message = "Event tidak ditemukan." });

        // Validate H-7 business rule
        var deadline = eventEntity.EventStartDate.AddDays(-7);
        if (DateTime.UtcNow > deadline)
        {
            return BadRequest(new
            {
                message = $"Pendaftaran sudah ditutup. Batas pendaftaran adalah {deadline:dd MMMM yyyy HH:mm} (H-7 sebelum lomba dimulai)."
            });
        }

        // Check event status
        if (eventEntity.Status != "Open")
        {
            return BadRequest(new { message = "Event ini sudah ditutup untuk pendaftaran." });
        }

        // Check duplicate registration
        if (await _registrationRepository.UserAlreadyRegisteredAsync(userId, request.EventId))
        {
            return Conflict(new { message = "Anda sudah terdaftar pada event ini." });
        }

        // Validate all files are PDFs
        var files = new Dictionary<string, IFormFile>
        {
            { "KartuPelajar", request.KartuPelajar },
            { "KartuKeluarga", request.KartuKeluarga },
            { "SuratKeteranganSehat", request.SuratKeteranganSehat }
        };

        foreach (var (docType, file) in files)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = $"Dokumen {docType} wajib diunggah." });
            }

            if (!_fileService.IsValidPdf(file))
            {
                return BadRequest(new { message = $"File {docType} harus berformat PDF (.pdf)." });
            }
        }

        // Create registration
        var registration = new Registration
        {
            UserId = userId,
            EventId = request.EventId,
            Status = "Pending",
            RegisteredAt = DateTime.UtcNow
        };

        await _registrationRepository.CreateAsync(registration);

        // Save documents
        foreach (var (docType, file) in files)
        {
            var subFolder = Path.Combine("registrations", registration.Id.ToString());
            var (fileName, filePath) = await _fileService.SaveFileAsync(file, subFolder);

            var document = new Document
            {
                RegistrationId = registration.Id,
                DocumentType = docType,
                FileName = fileName,
                FilePath = filePath,
                UploadedAt = DateTime.UtcNow
            };

            await _documentRepository.CreateAsync(document);
        }

        // Reload with includes
        var created = await _registrationRepository.GetByIdAsync(registration.Id);
        return CreatedAtAction(nameof(GetAll), MapToResponse(created!));
    }

    /// <summary>
    /// Verify or reject a registration. Admin only.
    /// </summary>
    [HttpPut("{id}/verify")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RegistrationResponse>> Verify(int id, [FromBody] VerifyRegistrationRequest request)
    {
        if (request.Status != "Verified" && request.Status != "Rejected")
        {
            return BadRequest(new { message = "Status harus 'Verified' atau 'Rejected'." });
        }

        var registration = await _registrationRepository.GetByIdAsync(id);
        if (registration == null)
            return NotFound(new { message = "Pendaftaran tidak ditemukan." });

        registration.Status = request.Status;

        // Generate verification letter PDF when status is Verified
        if (request.Status == "Verified")
        {
            registration.VerifiedAt = DateTime.UtcNow;

            var adminUserId = GetCurrentUserId();
            var adminUser = await _userRepository.GetByIdAsync(adminUserId);
            var adminName = adminUser?.FullName ?? "Admin";

            var participantName = registration.User?.FullName ?? "Peserta";

            var subFolder = Path.Combine("letters", $"registration-{registration.Id}");
            var letterPath = await _pdfService.GenerateVerificationLetterAsync(
                participantName,
                adminName,
                registration.VerifiedAt.Value,
                subFolder);

            registration.VerificationLetterPath = letterPath;
        }

        await _registrationRepository.UpdateAsync(registration);

        return Ok(MapToResponse(registration));
    }

    /// <summary>
    /// Download verification letter PDF. Pendaftar can only download their own.
    /// </summary>
    [HttpGet("{id}/letter")]
    public async Task<IActionResult> DownloadLetter(int id)
    {
        var registration = await _registrationRepository.GetByIdAsync(id);
        if (registration == null)
            return NotFound(new { message = "Pendaftaran tidak ditemukan." });

        // Authorization: Admin can download any, Pendaftar only their own
        var currentUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && registration.UserId != currentUserId)
            return Forbid();

        if (string.IsNullOrEmpty(registration.VerificationLetterPath))
            return NotFound(new { message = "Surat verifikasi belum tersedia." });

        var filePath = _fileService.GetFilePath(registration.VerificationLetterPath);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File surat verifikasi tidak ditemukan." });

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(fileBytes, "application/pdf", "Surat_Verifikasi.pdf");
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(userIdClaim!.Value);
    }

    private static RegistrationResponse MapToResponse(Registration r)
    {
        return new RegistrationResponse
        {
            Id = r.Id,
            UserId = r.UserId,
            UserFullName = r.User?.FullName ?? "",
            UserEmail = r.User?.Email ?? "",
            EventId = r.EventId,
            EventName = r.Event?.Name ?? "",
            Status = r.Status,
            RegisteredAt = r.RegisteredAt,
            HasVerificationLetter = !string.IsNullOrEmpty(r.VerificationLetterPath),
            Documents = r.Documents?.Select(d => new DocumentResponse
            {
                Id = d.Id,
                RegistrationId = d.RegistrationId,
                DocumentType = d.DocumentType,
                FileName = d.FileName,
                UploadedAt = d.UploadedAt
            }).ToList() ?? new List<DocumentResponse>()
        };
    }
}
