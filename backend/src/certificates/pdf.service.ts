import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { MedicalCertificate, Patient } from '@prisma/client';

@Injectable()
export class PdfService {
  async generateCertificatePdf(certificate: MedicalCertificate & { patient: Patient }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header
      doc.fontSize(20).text('MEDICAL CLINIC', { align: 'center' });
      doc.fontSize(10).text('123 Healthcare Ave, Wellness City', { align: 'center' });
      doc.text('Contact: (555) 0123-4567 | Email: clinic@ehealth.com', { align: 'center' });
      doc.moveDown(2);

      // Title
      doc.fontSize(16).font('Helvetica-Bold').text('MEDICAL CERTIFICATE', { align: 'center', underline: true });
      doc.moveDown(2);

      // Date and Reference
      doc.fontSize(10).font('Helvetica').text(`Date: ${new Date(certificate.issuedAt).toLocaleDateString()}`, { align: 'right' });
      doc.text(`Ref No: ${certificate.certificateNo}`, { align: 'right' });
      doc.moveDown(2);

      // Body
      doc.fontSize(12).text('To Whom It May Concern:', { align: 'left' });
      doc.moveDown();

      const patientName = `${certificate.patient.firstName} ${certificate.patient.lastName}`;
      const dob = new Date(certificate.patient.dateOfBirth).toLocaleDateString();
      
      doc.text(`This is to certify that `, { continued: true })
         .font('Helvetica-Bold').text(patientName, { continued: true })
         .font('Helvetica').text(`, born on ${dob}, was examined at this clinic.`);
      doc.moveDown();

      if (certificate.diagnosis) {
        doc.font('Helvetica-Bold').text('Diagnosis: ', { continued: true })
           .font('Helvetica').text(certificate.diagnosis);
        doc.moveDown();
      }

      doc.font('Helvetica-Bold').text('Clinical Recommendation:');
      doc.font('Helvetica').text(certificate.recommendation);
      doc.moveDown();

      if (certificate.startDate && certificate.endDate) {
        const start = new Date(certificate.startDate).toLocaleDateString();
        const end = new Date(certificate.endDate).toLocaleDateString();
        doc.text(`The patient is advised to rest from `, { continued: true })
           .font('Helvetica-Bold').text(start, { continued: true })
           .font('Helvetica').text(` to `, { continued: true })
           .font('Helvetica-Bold').text(end, { continued: true })
           .font('Helvetica').text(`.`);
        doc.moveDown();
      }

      if (certificate.returnDate) {
        const ret = new Date(certificate.returnDate).toLocaleDateString();
        doc.text(`Patient may return to duty on `, { continued: true })
           .font('Helvetica-Bold').text(ret, { continued: true })
           .font('Helvetica').text(`.`);
        doc.moveDown(2);
      }

      // Closing
      doc.moveDown(4);
      doc.font('Helvetica-Bold').text('__________________________', { align: 'right' });
      doc.text('Attending Physician', { align: 'right' });
      doc.fontSize(10).font('Helvetica').text('License No: PRC-99988877', { align: 'right' });

      doc.end();
    });
  }
}
