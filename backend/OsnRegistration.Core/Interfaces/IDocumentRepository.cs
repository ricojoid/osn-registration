using OsnRegistration.Core.Entities;

namespace OsnRegistration.Core.Interfaces;

public interface IDocumentRepository
{
    Task<Document?> GetByIdAsync(int id);
    Task<IEnumerable<Document>> GetByRegistrationIdAsync(int registrationId);
    Task<Document> CreateAsync(Document document);
}
