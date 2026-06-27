using Microsoft.EntityFrameworkCore;
using OsnRegistration.Core.Entities;

namespace OsnRegistration.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Registration> Registrations { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).HasDefaultValue("Pendaftar");
        });

        // Event configuration
        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.Status).HasDefaultValue("Open");
            // Ignore computed property RegistrationDeadline (not mapped to DB)
            entity.Ignore(e => e.RegistrationDeadline);
        });

        // Registration configuration
        modelBuilder.Entity<Registration>(entity =>
        {
            entity.HasOne(r => r.User)
                  .WithMany(u => u.Registrations)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Event)
                  .WithMany(e => e.Registrations)
                  .HasForeignKey(r => r.EventId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.Status).HasDefaultValue("Pending");

            // Unique constraint: one user can only register once per event
            entity.HasIndex(r => new { r.UserId, r.EventId }).IsUnique();
        });

        // Document configuration
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasOne(d => d.Registration)
                  .WithMany(r => r.Documents)
                  .HasForeignKey(d => d.RegistrationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Notification configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.User)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed an Admin user (password: Admin123!)
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            FullName = "Admin OSN",
            Email = "admin@osn.id",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = "Admin",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
