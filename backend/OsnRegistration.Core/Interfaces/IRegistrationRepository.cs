using OsnRegistration.Core.Entities;

namespace OsnRegistration.Core.Interfaces;

public interface IRegistrationRepository
{
    Task<IEnumerable<Registration>> GetAllAsync();
    Task<IEnumerable<Registration>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Registration>> GetByEventIdAsync(int eventId);
    Task<Registration?> GetByIdAsync(int id);
    Task<Registration> CreateAsync(Registration registration);
    Task<Registration> UpdateAsync(Registration registration);
    Task<bool> UserAlreadyRegisteredAsync(int userId, int eventId);
}
