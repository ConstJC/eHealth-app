import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointments.dto';
import { toUTC, toUTCDateOnly, toUTCEndOfDay } from '../common/utils/date.utils';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        ...dto,
        startTime: toUTC(dto.startTime),
        endTime: toUTC(dto.endTime),
      },
      include: {
        patient: true,
      }
    });
  }

  async findAll(status?: AppointmentStatus[], date?: string) {
    const where: any = {};
    
    // Handle multiple status values
    if (status && status.length > 0) {
      where.status = status.length === 1 ? status[0] : { in: status };
    }
    
    // Handle date filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    
    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: {
        startTime: 'asc',
      }
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
      }
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? toUTC(dto.startTime) : undefined,
        endTime: dto.endTime ? toUTC(dto.endTime) : undefined,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.appointment.delete({
      where: { id }
    });
  }
}
