using Microsoft.AspNetCore.Mvc;
using OsnRegistration.Core.DTOs.Auth;
using OsnRegistration.Core.Entities;
using OsnRegistration.Core.Interfaces;
using OsnRegistration.Infrastructure.Services;

namespace OsnRegistration.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly JwtService _jwtService;

    public AuthController(IUserRepository userRepository, JwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    /// <summary>
    /// Register a new user (Admin or Pendaftar).
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        // Validate role
        if (request.Role != "Admin" && request.Role != "Pendaftar")
        {
            return BadRequest(new { message = "Role harus 'Admin' atau 'Pendaftar'." });
        }

        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            return Conflict(new { message = "Email sudah terdaftar." });
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Token = token
        });
    }

    /// <summary>
    /// Login with email and password.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Email atau password salah." });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Token = token
        });
    }
}
