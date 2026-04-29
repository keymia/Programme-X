import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

type EmailKind = "welcome" | "registration_received" | "matching_confirmed" | "meeting_reminder" | "program_end" | "satisfaction";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });

  private template(kind: EmailKind, name: string, data?: Record<string, string>) {
    const base = (title: string, subtitle: string, body: string) => ({
      subject: `${title} | Black Med Collective`,
      html: `<!doctype html><html><body style="margin:0;background:#090909;color:#f7f5ef;font-family:Segoe UI,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:26px;">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#121212;border:1px solid #2a2a2a;">
      <tr><td style="padding:26px 32px;border-bottom:1px solid #2a2a2a;"><div style="color:#c9a96b;font-size:12px;letter-spacing:.12em;text-transform:uppercase;">Black Med Collective Platform</div>
      <h1 style="margin:12px 0 6px;font-size:28px;color:#f7f5ef;">${title}</h1><p style="margin:0;color:#c9c0ad;">${subtitle}</p></td></tr>
      <tr><td style="padding:28px 32px;"><p style="margin:0 0 14px;color:#f7f5ef;">Bonjour ${name},</p><p style="margin:0 0 16px;color:#c9c0ad;line-height:1.6;">${body}</p>
      <a href="${process.env.PLATFORM_URL || "#"}" style="display:inline-block;padding:10px 16px;background:#c9a96b;color:#090909;text-decoration:none;font-weight:700;">Accéder à la plateforme</a></td></tr>
      </table></td></tr></table></body></html>`
    });
    switch (kind) {
      case "welcome": return base("Bienvenue", "Votre accès institutionnel est activé.", "Merci de rejoindre notre communauté d'excellence.");
      case "registration_received": return base("Inscription Reçue", "Votre dossier est en cours d'analyse.", "Nous avons bien reçu votre inscription et notre équipe la traite.");
      case "matching_confirmed": return base("Jumelage Confirmé", "Votre mentorat est officiellement validé.", `Votre jumelage est confirmé. ${data?.details || ""}`);
      case "meeting_reminder": return base("Rappel Rencontre", "Votre session approche.", `Rappel: ${data?.details || "votre rencontre de mentorat est planifiée."}`);
      case "program_end": return base("Fin De Programme", "Merci pour votre engagement.", "Le programme se termine. Votre impact est remarquable.");
      case "satisfaction": return base("Satisfaction", "Votre avis compte.", "Merci de compléter notre courte enquête de satisfaction.");
    }
  }

  async send(to: string, name: string, kind: EmailKind, data?: Record<string, string>) {
    const from = process.env.SMTP_FROM || "noreply@blackmedcollective.com";
    const content = this.template(kind, name, data);
    if (!process.env.SMTP_HOST) {
      this.logger.log(`SMTP not configured. Email skipped: ${kind} -> ${to}`);
      return;
    }
    await this.transporter.sendMail({ from, to, subject: content.subject, html: content.html });
  }
}

