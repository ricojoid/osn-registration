using Microsoft.EntityFrameworkCore;
using OsnRegistration.Core.Entities;
using OsnRegistration.Core.Interfaces;
using OsnRegistration.Infrastructure.Data;

namespace OsnRegistration.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly AppDbContext _context;

    public DocumentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Document?> GetByIdAsync(int id)
    {
        return await _context.Documents.FindAsync(id);
    }

    public async Task<IEnumerable<Document>> GetByRegistrationIdAsync(int registrationId)
    {
        return await _context.Documents
            .Where(d => d.RegistrationId == registrationId)
            .ToListAsync();
    }

    public async Task<Document> CreateAsync(Document document)
    {
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        return document;
    }
}
