/**
 * Format a date string to locale-friendly format.
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date string with time.
 */
export function formatDateTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate days remaining until a deadline.
 */
export function getDaysRemaining(deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if registration is still open (more than 7 days before event start).
 */
export function isRegistrationOpen(eventStartDate) {
  const deadline = new Date(eventStartDate);
  deadline.setDate(deadline.getDate() - 7);
  return new Date() < deadline;
}

/**
 * Get initials from a full name.
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Extract error message from API response.
 */
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

/**
 * Validate that a file is a PDF.
 */
export function isValidPdf(file) {
  if (!file) return false;
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'pdf' && file.type === 'application/pdf';
}

/**
 * Format file size to human-readable string.
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
