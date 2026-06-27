namespace OsnRegistration.Core.Interfaces;

public interface IPdfService
{
    /// <summary>
    /// Generates a verification letter PDF for a verified registration.
    /// </summary>
    /// <param name="participantName">Full name of the participant</param>
    /// <param name="verifierName">Full name of the admin who verified</param>
    /// <param name="verificationDate">Date of verification</param>
    /// <param name="subFolder">Sub-folder to save the PDF (e.g., "letters/registration-{id}")</param>
    /// <returns>Relative file path of the generated PDF</returns>
    Task<string> GenerateVerificationLetterAsync(
        string participantName,
        string verifierName,
        DateTime verificationDate,
        string subFolder);

    /// <summary>
    /// Generates a cancellation/postponement apology letter PDF for an event.
    /// </summary>
    Task<string> GenerateCancellationLetterAsync(
        string eventName,
        string cancellationType,
        string reason,
        string adminName,
        DateTime letterDate,
        string subFolder);

    /// <summary>
    /// Generates a rescheduling letter PDF for an event.
    /// </summary>
    Task<string> GenerateRescheduleLetterAsync(
        string eventName,
        DateTime newStartDate,
        DateTime newEndDate,
        string adminName,
        DateTime letterDate,
        string subFolder);
}
