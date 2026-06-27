using OsnRegistration.Core.Entities;

namespace OsnRegistration.Core.Interfaces;

public interface IEventRepository
{
    Task<IEnumerable<Event>> GetAllAsync();
    Task<Event?> GetByIdAsync(int id);
    Task<Event> CreateAsync(Event eventEntity);
    Task<Event> UpdateAsync(Event eventEntity);
    Task<bool> DeleteAsync(int id);
}
