using Microsoft.EntityFrameworkCore;
using OsnRegistration.Core.Entities;
using OsnRegistration.Core.Interfaces;
using OsnRegistration.Infrastructure.Data;

namespace OsnRegistration.Infrastructure.Repositories;

public class RegistrationRepository : IRegistrationRepository
{
    private readonly AppDbContext _context;

    public RegistrationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Registration>> GetAllAsync()
    {
        return await _context.Registrations
            .Include(r => r.User)
            .Include(r => r.Event)
            .Include(r => r.Documents)
            .OrderByDescending(r => r.RegisteredAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Registration>> GetByUserIdAsync(int userId)
    {
        return await _context.Registrations
            .Include(r => r.Event)
            .Include(r => r.Documents)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.RegisteredAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Registration>> GetByEventIdAsync(int eventId)
    {
        return await _context.Registrations
            .Include(r => r.User)
            .Include(r => r.Documents)
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.RegisteredAt)
            .ToListAsync();
    }

    public async Task<Registration?> GetByIdAsync(int id)
    {
        return await _context.Registrations
            .Include(r => r.User)
            .Include(r => r.Event)
            .Include(r => r.Documents)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Registration> CreateAsync(Registration registration)
    {
        _context.Registrations.Add(registration);
        await _context.SaveChangesAsync();
        return registration;
    }

    public async Task<Registration> UpdateAsync(Registration registration)
    {
        _context.Registrations.Update(registration);
        await _context.SaveChangesAsync();
        return registration;
    }

    public async Task<bool> UserAlreadyRegisteredAsync(int userId, int eventId)
    {
        return await _context.Registrations
            .AnyAsync(r => r.UserId == userId && r.EventId == eventId);
    }
}
