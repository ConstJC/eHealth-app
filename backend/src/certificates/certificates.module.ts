import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { PdfService } from './pdf.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, PdfService, PrismaService],
  exports: [CertificatesService, PdfService],
})
export class CertificatesModule {}
