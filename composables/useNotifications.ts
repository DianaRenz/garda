export const useNotifications = () => {
  const config = useRuntimeConfig();

  const isConfigured = () =>
    !!(config.public.emailjsPublicKey && config.public.emailjsServiceId);

  /**
   * Notify admin when a guest submits a new booking request.
   * EmailJS template variables: guest_name, guest_email, guest_phone, start_date, end_date, notes
   */
  const notifyAdminNewRequest = async (params: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    startDate: string;
    endDate: string;
    notes: string;
  }) => {
    if (!isConfigured() || !config.public.emailjsAdminTemplateId) return;
    try {
      const emailjs = (await import("@emailjs/browser")).default;
      await emailjs.send(
        config.public.emailjsServiceId,
        config.public.emailjsAdminTemplateId,
        {
          guest_name: params.guestName,
          guest_email: params.guestEmail,
          guest_phone: params.guestPhone || "—",
          start_date: params.startDate,
          end_date: params.endDate,
          notes: params.notes || "—",
        },
        { publicKey: config.public.emailjsPublicKey },
      );
    } catch (e) {
      console.warn("[notifications] admin notification failed", e);
    }
  };

  /**
   * Notify guest when admin confirms or rejects their booking.
   * EmailJS template variables: to_email, guest_name, status, start_date, end_date, rejection_note
   */
  const notifyGuestStatusUpdate = async (params: {
    guestName: string;
    guestEmail: string;
    status: string;
    startDate: string;
    endDate: string;
    rejectionNote?: string | null;
  }) => {
    if (!isConfigured() || !config.public.emailjsGuestTemplateId || !params.guestEmail) return;
    try {
      const emailjs = (await import("@emailjs/browser")).default;
      await emailjs.send(
        config.public.emailjsServiceId,
        config.public.emailjsGuestTemplateId,
        {
          to_email: params.guestEmail,
          guest_name: params.guestName,
          status: params.status,
          start_date: params.startDate,
          end_date: params.endDate,
          rejection_note: params.rejectionNote || "",
        },
        { publicKey: config.public.emailjsPublicKey },
      );
    } catch (e) {
      console.warn("[notifications] guest notification failed", e);
    }
  };

  return { notifyAdminNewRequest, notifyGuestStatusUpdate };
};
