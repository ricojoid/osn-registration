using OsnRegistration.Core.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace OsnRegistration.Infrastructure.Services;

public class PdfService : IPdfService
{
    private readonly string _uploadPath;

    public PdfService(string uploadPath)
    {
        _uploadPath = uploadPath;
    }

    /// <summary>
    /// Returns the absolute path to Letterhead.png bundled with the API.
    /// </summary>
    private static string LogoPath =>
        Path.Combine(AppContext.BaseDirectory, "Assets", "Letterhead.png");

    /// <summary>
    /// Signature block — landscape rectangle stamp:
    ///   LEFT: logo | RIGHT: digital text + name + NIP
    ///   "Ketua Pelaksana" outside/below the box
    /// </summary>
    private static void RenderDigitalStamp(ColumnDescriptor col, string signerName)
    {
        col.Item().AlignRight().Width(210).Column(sig =>
        {
            sig.Item().Text("Hormat kami,").FontSize(11);
            sig.Item().Text("Ketua Panitia Pelaksana,").FontSize(11);

            sig.Item().Height(8);

            // Landscape rectangle stamp box — thicker border
            sig.Item().Border(2f).BorderColor(Colors.Grey.Darken2)
                .Padding(10).Row(row =>
                {
                    // LEFT: logo (slightly smaller)
                    row.ConstantItem(48).Column(logoCol =>
                    {
                        var logoPath = LogoPath;
                        if (File.Exists(logoPath))
                        {
                            logoCol.Item().AlignCenter().AlignMiddle()
                                .Width(42).Image(logoPath).FitWidth();
                        }
                    });

                    // Vertical divider
                    row.ConstantItem(1).Background(Colors.Grey.Darken2);

                    // Spacer
                    row.ConstantItem(8);

                    // RIGHT: digital signature text
                    row.RelativeItem().Column(textCol =>
                    {
                        textCol.Item()
                            .Text("Ditandatangani secara digital oleh:")
                            .FontSize(8f).Italic().FontColor(Colors.Grey.Darken2);

                        // Push name+NIP further down
                        textCol.Item().Height(10);

                        textCol.Item()
                            .Text(signerName)
                            .Bold().FontSize(10);

                        textCol.Item().Height(3);

                        textCol.Item()
                            .Text("NIP. 19850312 201012 1 002")
                            .FontSize(8f).FontColor(Colors.Grey.Darken2);
                    });
                });

        });
    }

    public Task<string> GenerateVerificationLetterAsync(
        string participantName,
        string verifierName,
        DateTime verificationDate,
        string subFolder)
    {
        var folderPath = Path.Combine(_uploadPath, subFolder);
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var fileName = "Surat_Verifikasi.pdf";
        var fullPath = Path.Combine(folderPath, fileName);
        var relativePath = Path.Combine(subFolder, fileName);

        var formattedDate = verificationDate.ToString("dd MMMM yyyy",
            new System.Globalization.CultureInfo("id-ID"));

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginTop(50);
                page.MarginBottom(50);
                page.MarginLeft(60);
                page.MarginRight(60);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Times New Roman"));

                page.Content().Column(col =>
                {
                    // === HEADER ===
                    col.Item().AlignCenter().Text("PANITIA PELAKSANA OLIMPIADE SAINS NASIONAL")
                        .Bold().FontSize(13);
                    col.Item().AlignCenter().Text("KOMITE PEMBINAAN PRESTASI TINGKAT KABUPATEN")
                        .Bold().FontSize(11);
                    col.Item().AlignCenter().Text("Sekretariat: Jl. Pendidikan No. 45, Telp: (021) 555-1234, Email: osn.kabupaten@edu.mail")
                        .FontSize(9).FontColor(Colors.Grey.Darken1);

                    // Separator line
                    col.Item().PaddingTop(8).PaddingBottom(16)
                        .LineHorizontal(1.5f).LineColor(Colors.Black);

                    // === DATE ===
                    col.Item().AlignRight().Text($"Jakarta, {formattedDate}").FontSize(11);

                    col.Item().Height(20);

                    // === SUBJECT ===
                    col.Item().Text(text =>
                    {
                        text.Span("Hal     : ").Bold();
                        text.Span("Surat Keterangan Registrasi Peserta");
                    });
                    col.Item().Text(text =>
                    {
                        text.Span("Nomor   : ").Bold();
                        text.Span("042/PAN-OSN/KAB/I/2026");
                    });

                    col.Item().Height(24);

                    // === BODY ===
                    col.Item().Text("Dengan hormat,").FontSize(11);

                    col.Item().Height(12);

                    col.Item().Text("Berdasarkan hasil verifikasi berkas pendaftaran dan validasi database peserta Olimpiade Sains Nasional (OSN) Tingkat Kabupaten tahun 2026, Panitia Pelaksana dengan ini menyatakan bahwa peserta yang tercantum di bawah ini:")
                        .LineHeight(1.5f);

                    col.Item().Height(16);

                    // === PARTICIPANT DATA ===
                    col.Item().PaddingLeft(30).Column(dataCol =>
                    {
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Nama Lengkap      : ").Bold();
                            text.Span(participantName);
                        });
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Status Kelulusan  : ").Bold();
                            text.Span("TERREGISTRASI / RESMI");
                        });
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Kategori Lomba    : ").Bold();
                            text.Span("Olimpiade Sains Nasional (OSN)");
                        });
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Tingkat Kompetisi : ").Bold();
                            text.Span("Kabupaten");
                        });
                    });

                    col.Item().Height(16);

                    col.Item().Text("Telah resmi terdaftar sebagai peserta aktif yang sah dan berhak mengikuti rangkaian kompetisi OSN di tingkat kabupaten. Sehubungan dengan hal tersebut, kami mengimbau kepada peserta yang bersangkutan agar dapat mempersiapkan diri dengan sebaik-baiknya secara akademis maupun teknis sebelum tanggal 17 Januari 2026 guna mengikuti jalannya perlombaan.")
                        .LineHeight(1.5f);

                    col.Item().Height(12);

                    col.Item().Text("Demikian surat keterangan ini diterbitkan untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian, kerja sama, dan semangat juang yang ditunjukkan, kami ucapkan terima kasih.")
                        .LineHeight(1.5f);

                    col.Item().Height(24);

                    // === SIGNATURE ===
                    RenderDigitalStamp(col, verifierName);
                });
            });
        }).GeneratePdf(fullPath);

        return Task.FromResult(relativePath);
    }

    public Task<string> GenerateCancellationLetterAsync(
        string eventName,
        string cancellationType,
        string reason,
        string adminName,
        DateTime letterDate,
        string subFolder)
    {
        var folderPath = Path.Combine(_uploadPath, subFolder);
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var fileName = cancellationType == "Cancelled"
            ? "Surat_Pembatalan.pdf"
            : "Surat_Penundaan.pdf";
        var fullPath = Path.Combine(folderPath, fileName);
        var relativePath = Path.Combine(subFolder, fileName);

        var formattedDate = letterDate.ToString("dd MMMM yyyy",
            new System.Globalization.CultureInfo("id-ID"));

        var typeLabel = cancellationType == "Cancelled" ? "Pembatalan" : "Penundaan";

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginTop(50);
                page.MarginBottom(50);
                page.MarginLeft(60);
                page.MarginRight(60);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Times New Roman"));

                page.Content().Column(col =>
                {
                    // === HEADER ===
                    col.Item().AlignCenter().Text("PANITIA PELAKSANA OLIMPIADE SAINS NASIONAL")
                        .Bold().FontSize(13);
                    col.Item().AlignCenter().Text("KOMITE PEMBINAAN PRESTASI TINGKAT KABUPATEN")
                        .Bold().FontSize(11);
                    col.Item().AlignCenter().Text("Sekretariat: Jl. Pendidikan No. 45, Telp: (021) 555-1234, Email: osn.kabupaten@edu.mail")
                        .FontSize(9).FontColor(Colors.Grey.Darken1);

                    // Separator line
                    col.Item().PaddingTop(8).PaddingBottom(16)
                        .LineHorizontal(1.5f).LineColor(Colors.Black);

                    // === DATE ===
                    col.Item().AlignRight().Text($"Jakarta, {formattedDate}").FontSize(11);

                    col.Item().Height(20);

                    // === SUBJECT ===
                    col.Item().Text(text =>
                    {
                        text.Span("Hal     : ").Bold();
                        text.Span($"Surat Pernyataan {typeLabel} Kegiatan Lomba");
                    });
                    col.Item().Text(text =>
                    {
                        text.Span("Nomor   : ").Bold();
                        text.Span($"043/PAN-OSN/KAB/{typeLabel.Substring(0, 1)}/2026");
                    });

                    col.Item().Height(24);

                    // === BODY ===
                    col.Item().Text("Kepada Yth.").FontSize(11);
                    col.Item().Text("Seluruh Peserta dan Pihak Terkait").FontSize(11);
                    col.Item().Text($"Lomba {eventName}").FontSize(11).Bold();

                    col.Item().Height(16);

                    col.Item().Text("Dengan hormat,").FontSize(11);

                    col.Item().Height(12);

                    col.Item().Text($"Melalui surat ini, Panitia Pelaksana Olimpiade Sains Nasional (OSN) Tingkat Kabupaten menyampaikan permohonan maaf yang sebesar-besarnya kepada seluruh peserta dan pihak terkait atas {typeLabel.ToLower()} pelaksanaan kegiatan lomba berikut:")
                        .LineHeight(1.5f);

                    col.Item().Height(16);

                    // === EVENT DATA ===
                    col.Item().PaddingLeft(30).Column(dataCol =>
                    {
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Nama Kegiatan     : ").Bold();
                            text.Span(eventName);
                        });
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Status Kegiatan   : ").Bold();
                            text.Span(cancellationType == "Cancelled" ? "DIBATALKAN" : "DITUNDA");
                        });
                    });

                    col.Item().Height(16);

                    col.Item().Text($"Adapun {typeLabel.ToLower()} ini dilakukan dengan alasan sebagai berikut:")
                        .LineHeight(1.5f);

                    col.Item().Height(12);

                    // === REASON BOX ===
                    col.Item().PaddingLeft(30).PaddingRight(30)
                        .Border(1).BorderColor(Colors.Grey.Medium)
                        .Padding(12)
                        .Text($"\"{reason}\"")
                        .Italic().LineHeight(1.5f);

                    col.Item().Height(16);

                    if (cancellationType == "Postponed")
                    {
                        col.Item().Text("Jadwal pengganti pelaksanaan lomba akan diinformasikan lebih lanjut melalui kanal komunikasi resmi panitia. Kami mohon seluruh peserta untuk tetap mempersiapkan diri dan memantau informasi terbaru.")
                            .LineHeight(1.5f);
                    }
                    else
                    {
                        col.Item().Text("Dengan berat hati, kami menyatakan bahwa seluruh rangkaian kegiatan lomba tersebut tidak akan dilanjutkan. Kami memahami bahwa keputusan ini dapat menimbulkan kekecewaan bagi seluruh pihak yang telah mempersiapkan diri.")
                            .LineHeight(1.5f);
                    }

                    col.Item().Height(12);

                    col.Item().Text("Demikian surat pernyataan ini kami sampaikan dengan penuh rasa hormat. Atas pengertian, kesabaran, dan kerja sama yang diberikan, kami mengucapkan terima kasih yang sebesar-besarnya.")
                        .LineHeight(1.5f);

                    col.Item().Height(24);

                    // === SIGNATURE ===
                    RenderDigitalStamp(col, adminName);
                });
            });
        }).GeneratePdf(fullPath);

        return Task.FromResult(relativePath);
    }

    public Task<string> GenerateRescheduleLetterAsync(
        string eventName,
        DateTime newStartDate,
        DateTime newEndDate,
        string adminName,
        DateTime letterDate,
        string subFolder)
    {
        var folderPath = Path.Combine(_uploadPath, subFolder);
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var fileName = "Surat_Penjadwalan_Ulang.pdf";
        var fullPath = Path.Combine(folderPath, fileName);
        var relativePath = Path.Combine(subFolder, fileName);

        var formattedDate = letterDate.ToString("dd MMMM yyyy",
            new System.Globalization.CultureInfo("id-ID"));

        var formattedNewStart = newStartDate.ToString("dd MMMM yyyy HH:mm",
            new System.Globalization.CultureInfo("id-ID"));
        var formattedNewEnd = newEndDate.ToString("dd MMMM yyyy HH:mm",
            new System.Globalization.CultureInfo("id-ID"));

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginTop(50);
                page.MarginBottom(50);
                page.MarginLeft(60);
                page.MarginRight(60);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Times New Roman"));

                page.Content().Column(col =>
                {
                    // === HEADER ===
                    col.Item().AlignCenter().Text("PANITIA PELAKSANA OLIMPIADE SAINS NASIONAL")
                        .Bold().FontSize(13);
                    col.Item().AlignCenter().Text("KOMITE PEMBINAAN PRESTASI TINGKAT KABUPATEN")
                        .Bold().FontSize(11);
                    col.Item().AlignCenter().Text("Sekretariat: Jl. Pendidikan No. 45, Telp: (021) 555-1234, Email: osn.kabupaten@edu.mail")
                        .FontSize(9).FontColor(Colors.Grey.Darken1);

                    // Separator line
                    col.Item().PaddingTop(8).PaddingBottom(16)
                        .LineHorizontal(1.5f).LineColor(Colors.Black);

                    // === DATE ===
                    col.Item().AlignRight().Text($"Jakarta, {formattedDate}").FontSize(11);

                    col.Item().Height(20);

                    // === SUBJECT ===
                    col.Item().Text(text =>
                    {
                        text.Span("Hal     : ").Bold();
                        text.Span($"Surat Pemberitahuan Penjadwalan Ulang Lomba");
                    });
                    col.Item().Text(text =>
                    {
                        text.Span("Nomor   : ").Bold();
                        text.Span($"045/PAN-OSN/KAB/PU/2026");
                    });

                    col.Item().Height(24);

                    // === BODY ===
                    col.Item().Text("Kepada Yth.").FontSize(11);
                    col.Item().Text("Seluruh Peserta yang Telah Mendaftar").FontSize(11);
                    col.Item().Text($"Lomba {eventName}").FontSize(11).Bold();

                    col.Item().Height(16);

                    col.Item().Text("Dengan hormat,").FontSize(11);

                    col.Item().Height(12);

                    col.Item().Text($"Menyambung surat penundaan sebelumnya, Panitia Pelaksana Olimpiade Sains Nasional (OSN) Tingkat Kabupaten dengan ini memberitahukan bahwa jadwal perlombaan telah ditetapkan kembali dengan rincian sebagai berikut:")
                        .LineHeight(1.5f);

                    col.Item().Height(16);

                    // === EVENT DATA ===
                    col.Item().PaddingLeft(30).Column(dataCol =>
                    {
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Nama Kegiatan     : ").Bold();
                            text.Span(eventName);
                        });
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Tanggal Mulai Baru: ").Bold();
                            text.Span(formattedNewStart);
                        });
                        dataCol.Item().Text(text =>
                        {
                            text.Span("Tanggal Selesai   : ").Bold();
                            text.Span(formattedNewEnd);
                        });
                    });

                    col.Item().Height(16);

                    col.Item().Text("Seluruh peserta yang sebelumnya telah terdaftar diwajibkan untuk memperhatikan jadwal baru ini. Status pendaftaran Anda tetap sah dan tidak diperlukan pendaftaran ulang.")
                        .LineHeight(1.5f);

                    col.Item().Height(12);

                    col.Item().Text("Demikian pemberitahuan ini kami sampaikan. Kami mengucapkan terima kasih atas perhatian dan kerja samanya. Selamat mempersiapkan diri dan semoga sukses.")
                        .LineHeight(1.5f);

                    col.Item().Height(24);

                    // === SIGNATURE ===
                    RenderDigitalStamp(col, adminName);
                });
            });
        }).GeneratePdf(fullPath);

        return Task.FromResult(relativePath);
    }
}
