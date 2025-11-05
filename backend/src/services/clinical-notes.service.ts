import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ClinicalNote, ClinicalNoteType } from '@prisma/client';

export class ClinicalNotesService {
  async getPatientNotes(patientId: string): Promise<ClinicalNote[]> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const notes = await prisma.clinicalNote.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return notes as any;
  }

  async getNoteById(patientId: string, noteId: string): Promise<ClinicalNote> {
    const note = await prisma.clinicalNote.findFirst({
      where: {
        id: noteId,
        patientId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundError('Clinical note', noteId);
    }

    return note as any;
  }

  async createNote(
    patientId: string,
    data: {
      title: string;
      content: string;
      date: Date;
      type: ClinicalNoteType;
      authorId: string;
      consultationType?: string;
      specialty?: string;
    }
  ): Promise<ClinicalNote> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    // Verify author exists
    const author = await prisma.user.findUnique({
      where: { id: data.authorId },
    });

    if (!author) {
      throw new NotFoundError('User', data.authorId);
    }

    if (!data.title || !data.content || !data.date || !data.type || !data.authorId) {
      throw new ValidationError('Title, content, date, type, and author are required');
    }

    const note = await prisma.clinicalNote.create({
      data: {
        patientId,
        title: data.title,
        content: data.content,
        date: data.date,
        type: data.type,
        authorId: data.authorId,
        consultationType: data.consultationType,
        specialty: data.specialty,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return note as any;
  }

  async updateNote(
    patientId: string,
    noteId: string,
    data: Partial<{
      title: string;
      content: string;
      date: Date;
      type: ClinicalNoteType;
      consultationType: string;
      specialty: string;
    }>
  ): Promise<ClinicalNote> {
    // Verify note exists
    await this.getNoteById(patientId, noteId);

    const note = await prisma.clinicalNote.update({
      where: { id: noteId },
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return note as any;
  }

  async deleteNote(patientId: string, noteId: string): Promise<void> {
    await this.getNoteById(patientId, noteId);

    await prisma.clinicalNote.delete({
      where: { id: noteId },
    });
  }
}

export const clinicalNotesService = new ClinicalNotesService();

