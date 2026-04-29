import { Injectable } from "@nestjs/common";
import { MatchStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  private normalize(value: string) {
    return value.trim().toLowerCase();
  }

  private calcScore(mentor: any, mentee: any) {
    let score = 0;
    if (this.normalize(mentor.language) === this.normalize(mentee.language)) score += 25;
    if (this.normalize(mentor.level) === this.normalize(mentee.academicLevel)) score += 15;
    if (this.normalize(mentor.availability) === this.normalize(mentee.availability)) score += 20;
    if (this.normalize(mentor.region) === this.normalize(mentee.region)) score += 20;
    if (this.normalize(mentor.targetSpecialty) === this.normalize(mentee.targetSpecialty)) score += 20;
    return score;
  }

  async generate() {
    const mentors = await this.prisma.mentorApplication.findMany();
    const mentees = await this.prisma.menteeApplication.findMany();
    const results: { mentorId: string; menteeId: string; score: number }[] = [];

    for (const mentor of mentors) {
      const used = await this.prisma.matching.count({
        where: { mentorId: mentor.id, status: { in: [MatchStatus.PROPOSED, MatchStatus.APPROVED] } }
      });
      let remaining = Math.max(mentor.mentorCapacity - used, 0);
      if (remaining <= 0) continue;
      const ranked = mentees
        .map((mentee) => ({ menteeId: mentee.id, score: this.calcScore(mentor, mentee) }))
        .sort((a, b) => b.score - a.score);
      for (const r of ranked) {
        if (remaining <= 0) break;
        if (r.score < 40) continue;
        await this.prisma.matching.upsert({
          where: { mentorId_menteeId: { mentorId: mentor.id, menteeId: r.menteeId } },
          create: { mentorId: mentor.id, menteeId: r.menteeId, score: r.score, status: MatchStatus.PROPOSED },
          update: { score: r.score, status: MatchStatus.PROPOSED }
        });
        results.push({ mentorId: mentor.id, menteeId: r.menteeId, score: r.score });
        remaining--;
      }
    }
    return { generated: results.length, matches: results };
  }

  list() {
    return this.prisma.matching.findMany({ include: { mentor: true, mentee: true }, orderBy: { score: "desc" } });
  }

  async validateMatch(id: string, approved: boolean, notes?: string) {
    const updated = await this.prisma.matching.update({
      where: { id },
      data: { status: approved ? MatchStatus.APPROVED : MatchStatus.REJECTED, notes: notes || null }
    });
    if (approved) {
      const match = await this.prisma.matching.findUnique({
        where: { id: updated.id },
        include: { mentor: true, mentee: true }
      });
      if (match) {
        const details = `Mentor: ${match.mentor.fullName} | Specialty: ${match.mentor.targetSpecialty}`;
        await this.notificationsService.send(match.mentor.email, match.mentor.fullName, "matching_confirmed", { details });
        await this.notificationsService.send(match.mentee.email, match.mentee.fullName, "matching_confirmed", { details });
      }
    }
    return updated;
  }

  overrideMatch(id: string, mentorId: string, notes?: string) {
    return this.prisma.matching.update({
      where: { id },
      data: { mentorId, status: MatchStatus.OVERRIDDEN, notes: notes || null }
    });
  }
}
