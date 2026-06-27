using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OsnRegistration.Core.DTOs.Event;
using OsnRegistration.Core.Entities;
using OsnRegistration.Core.Interfaces;
using OsnRegistration.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OsnRegistration.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly IEventRepository _eventRepository;
    private readonly IPdfService _pdfService;
    private readonly IUserRepository _userRepository;
    private readonly IFileService _fileService;
    private readonly AppDbContext _context;

    public EventsController(
        IEventRepository eventRepository,
        IPdfService pdfService,
        IUserRepository userRepository,
        IFileService fileService,
        AppDbContext context)
    {
        _eventRepository = eventRepository;
        _pdfService = pdfService;
        _userRepository = userRepository;
        _fileService = fileService;
        _context = context;
    }

    /// <summary>
    /// Get all events. Available to all authenticated users.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EventResponse>>> GetAll()
    {
        var events = await _eventRepository.GetAllAsync();

        var response = events.Select(e => MapToResponse(e));
        return Ok(response);
    }

    /// <summary>
    /// Get event by ID. Available to all authenticated users.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<EventResponse>> GetById(int id)
    {
        var eventEntity = await _eventRepository.GetByIdAsync(id);
        if (eventEntity == null)
            return NotFound(new { message = "Event tidak ditemukan." });

        return Ok(MapToResponse(eventEntity));
    }

    /// <summary>
    /// Create a new event. Admin only.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EventResponse>> Create([FromBody] EventRequest request)
    {
        if (request.EventEndDate <= request.EventStartDate)
        {
            return BadRequest(new { message = "Tanggal selesai harus setelah tanggal mulai." });
        }

        var eventEntity = new Event
        {
            Name = request.Name,
            Description = request.Description,
            EventStartDate = request.EventStartDate,
            EventEndDate = request.EventEndDate,
            Location = request.Location,
            Status = "Open",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _eventRepository.CreateAsync(eventEntity);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToResponse(created));
    }

    /// <summary>
    /// Update an event. Admin only.
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EventResponse>> Update(int id, [FromBody] EventRequest request)
    {
        var eventEntity = await _eventRepository.GetByIdAsync(id);
        if (eventEntity == null)
            return NotFound(new { message = "Event tidak ditemukan." });

        if (request.EventEndDate <= request.EventStartDate)
        {
            return BadRequest(new { message = "Tanggal selesai harus setelah tanggal mulai." });
        }

        eventEntity.Name = request.Name;
        eventEntity.Description = request.Description;
        eventEntity.EventStartDate = request.EventStartDate;
        eventEntity.EventEndDate = request.EventEndDate;
        eventEntity.Location = request.Location;

        var updated = await _eventRepository.UpdateAsync(eventEntity);
        return Ok(MapToResponse(updated));
    }

    /// <summary>
    /// Cancel or postpone an event. Admin only.
    /// Generates a formal apology letter PDF.
    /// </summary>
    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EventResponse>> CancelEvent(int id, [FromBody] CancelEventRequest request)
    {
        if (request.Type != "Cancelled" && request.Type != "Postponed")
        {
            return BadRequest(new { message = "Tipe harus 'Cancelled' atau 'Postponed'." });
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(new { message = "Alasan wajib diisi." });
        }

        var eventEntity = await _eventRepository.GetByIdAsync(id);
        if (eventEntity == null)
            return NotFound(new { message = "Event tidak ditemukan." });

        if (eventEntity.Status == "Cancelled" || eventEntity.Status == "Postponed")
        {
            return BadRequest(new { message = $"Event ini sudah berstatus {eventEntity.Status}." });
        }

        // Get admin name
        var adminUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var adminUser = await _userRepository.GetByIdAsync(adminUserId);
        var adminName = adminUser?.FullName ?? "Admin";

        // Generate cancellation letter PDF
        var subFolder = Path.Combine("letters", $"event-{eventEntity.Id}");
        var letterPath = await _pdfService.GenerateCancellationLetterAsync(
            eventEntity.Name,
            request.Type,
            request.Reason,
            adminName,
            DateTime.UtcNow,
            subFolder);

        // Update event
        eventEntity.Status = request.Type;
        eventEntity.CancellationReason = request.Reason;
        eventEntity.CancellationLetterPath = letterPath;

        await _eventRepository.UpdateAsync(eventEntity);

        // Notify participants
        var participants = await _context.Registrations
            .Where(r => r.EventId == id)
            .Select(r => r.UserId)
            .Distinct()
            .ToListAsync();

        var actionId = request.Type == "Cancelled" ? "dibatalkan" : "ditunda";
        var notifications = participants.Select(userId => new Notification
        {
            UserId = userId,
            Title = $"Lomba {request.Type}",
            Message = $"Lomba {eventEntity.Name} telah {actionId}. Surat pemberitahuan resmi dapat diunduh di halaman utama lomba.",
            CreatedAt = DateTime.UtcNow
        }).ToList();

        if (notifications.Any())
        {
            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();
        }

        return Ok(MapToResponse(eventEntity));
    }

    /// <summary>
    /// Reschedule a postponed event. Admin only.
    /// Generates a formal rescheduling letter PDF and notifies registered users.
    /// </summary>
    [HttpPut("{id}/reschedule")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EventResponse>> RescheduleEvent(int id, [FromBody] RescheduleEventRequest request)
    {
        if (request.EventEndDate <= request.EventStartDate)
        {
            return BadRequest(new { message = "Tanggal selesai harus setelah tanggal mulai." });
        }

        var eventEntity = await _eventRepository.GetByIdAsync(id);
        if (eventEntity == null)
            return NotFound(new { message = "Event tidak ditemukan." });

        if (eventEntity.Status != "Postponed")
        {
            return BadRequest(new { message = "Hanya lomba yang berstatus 'Postponed' yang dapat dijadwalkan ulang." });
        }

        // Get admin name
        var adminUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var adminUser = await _userRepository.GetByIdAsync(adminUserId);
        var adminName = adminUser?.FullName ?? "Admin";

        // Generate reschedule letter PDF
        var subFolder = Path.Combine("letters", $"event-{eventEntity.Id}");
        var letterPath = await _pdfService.GenerateRescheduleLetterAsync(
            eventEntity.Name,
            request.EventStartDate,
            request.EventEndDate,
            adminName,
            DateTime.UtcNow,
            subFolder);

        // Update event
        eventEntity.Status = "Open";
        eventEntity.EventStartDate = request.EventStartDate;
        eventEntity.EventEndDate = request.EventEndDate;
        eventEntity.RescheduleLetterPath = letterPath;

        await _eventRepository.UpdateAsync(eventEntity);

        // Notify all registered participants
        if (eventEntity.Registrations != null && eventEntity.Registrations.Any())
        {
            var notifications = eventEntity.Registrations.Select(r => new Notification
            {
                UserId = r.UserId,
                Title = "Penjadwalan Ulang Lomba",
                Message = $"Lomba {eventEntity.Name} telah dijadwalkan ulang menjadi tanggal {request.EventStartDate:dd MMM yyyy}. Surat pemberitahuan resmi dapat diunduh di halaman utama.",
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();
        }

        return Ok(MapToResponse(eventEntity));
    }

    /// <summary>
    /// Download the cancellation/postponement letter PDF.
    /// </summary>
    [HttpGet("{id}/cancellation-letter")]
    public async Task<IActionResult> DownloadCancellationLetter(int id)
    {
        var eventEntity = await _eventRepository.GetByIdAsync(id);
        if (eventEntity == null)
            return NotFound(new { message = "Event tidak ditemukan." });

        if (string.IsNullOrEmpty(eventEntity.CancellationLetterPath))
            return NotFound(new { message = "Surat pembatalan/penundaan belum tersedia." });

        var filePath = _fileService.GetFilePath(eventEntity.CancellationLetterPath);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File surat tidak ditemukan." });

        var fileName = eventEntity.Status == "Cancelled"
            ? "Surat_Pembatalan.pdf"
            : "Surat_Penundaan.pdf";

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(fileBytes, "application/pdf", fileName);
    }

    /// <summary>
    /// Download the reschedule letter PDF.
    /// </summary>
    [HttpGet("{id}/reschedule-letter")]
    public async Task<IActionResult> DownloadRescheduleLetter(int id)
    {
        var eventEntity = await _eventRepository.GetByIdAsync(id);
        if (eventEntity == null)
            return NotFound(new { message = "Event tidak ditemukan." });

        if (string.IsNullOrEmpty(eventEntity.RescheduleLetterPath))
            return NotFound(new { message = "Surat penjadwalan ulang belum tersedia." });

        var filePath = _fileService.GetFilePath(eventEntity.RescheduleLetterPath);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File surat tidak ditemukan." });

        var fileName = "Surat_Penjadwalan_Ulang.pdf";

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(fileBytes, "application/pdf", fileName);
    }

    private static EventResponse MapToResponse(Event e)
    {
        return new EventResponse
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            EventStartDate = e.EventStartDate,
            EventEndDate = e.EventEndDate,
            RegistrationDeadline = e.RegistrationDeadline,
            Location = e.Location,
            Status = e.Status,
            CancellationReason = e.CancellationReason,
            HasCancellationLetter = !string.IsNullOrEmpty(e.CancellationLetterPath),
            HasRescheduleLetter = !string.IsNullOrEmpty(e.RescheduleLetterPath),
            TotalRegistrations = e.Registrations?.Count ?? 0,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt
        };
    }
}
