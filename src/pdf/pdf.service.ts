// src/pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reshaper = require('arabic-persian-reshaper');

interface Item {
  count: number;
  title: string;
  value: number;
}

@Injectable()
export class PdfService {
  async generatePdfToFile(
    amount: number,
    fileName: string,
    items: Item[],
  ): Promise<string> {
    const pdfPath = path.join(__dirname, '../../public/pdfs', fileName);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const dir = path.dirname(pdfPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    const fontPath = path.join(__dirname, '../../src/assets/fonts/Vazir.ttf');
    doc.registerFont('Vazir', fontPath);
    doc.font('Vazir');

    // Add logo image at the top center
    const logoPath = path.join(__dirname, '../../src/assets/logo.png');
    if (fs.existsSync(logoPath)) {
      // Center the logo horizontally, place it at y=30, width=80px
      doc.image(logoPath, doc.page.width / 2 - 40, 30, { width: 80 });
    }

    const companyName = reshaper.PersianShaper.convertArabic('بان شرکت');
    const description = reshaper.PersianShaper.convertArabic(
      'گزارش مصرف انرژی تجهیزات',
    );
    const totalText = reshaper.PersianShaper.convertArabic(`وات ${amount}`);

    const primaryColor = '#FFBC41';
    const lightGray = '#F5F5F5';

    doc.rect(0, 25, doc.page.width, 80).fill(primaryColor);
    doc.fillColor('white').fontSize(22).text(companyName, {
      align: 'center',
    });

    doc.moveDown(2);
    doc.fillColor('black').fontSize(14).text(description, { align: 'right' });

    doc.moveDown(1);
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1.5);
    doc
      .fontSize(14)
      .fillColor('#000')
      .text(reshaper.PersianShaper.convertArabic('جزئیات مصرف'), {
        align: 'right',
      });

    doc.moveDown(1);

    const startY = doc.y;
    const col1 = 70;
    const col2 = 180;
    const col3 = 480;

    doc.fontSize(13).fillColor('#ffffff');
    doc.rect(50, startY, 500, 30).fill(primaryColor);

    doc
      .fillColor('white')
      .text(reshaper.PersianShaper.convertArabic('ردیف'), col3, startY + 7, {
        align: 'right',
        width: 50,
      });
    doc.text(
      reshaper.PersianShaper.convertArabic('کالا عنوان'),
      col2,
      startY + 7,
      {
        align: 'right',
        width: 200,
      },
    );
    doc.text(
      reshaper.PersianShaper.convertArabic('مصرف مقدار'),
      col1,
      startY + 7,
      {
        align: 'right',
        width: 100,
      },
    );

    doc.moveDown(2);

    items.forEach((item, index) => {
      const rowY = doc.y;
      const totalValue = item.count * item.value;

      doc.fillColor('black').fontSize(12);

      doc.text(`${index + 1}`, col3, rowY, { align: 'right', width: 50 });

      doc.text(reshaper.PersianShaper.convertArabic(item.title), col2, rowY, {
        align: 'right',
        width: 200,
      });

      doc.text(
        reshaper.PersianShaper.convertArabic(`${totalValue} وات`),
        col1,
        rowY,
        {
          align: 'right',
          width: 100,
        },
      );

      doc.moveDown(1);
    });

    doc.moveDown(2);
    doc.rect(50, doc.y, 500, 40).fill(lightGray);
    doc
      .fillColor('black')
      .fontSize(16)
      .text(totalText, 70, doc.y + 10, {
        align: 'right',
        width: 460,
      });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(`/pdfs/${fileName}`));
      stream.on('error', reject);
    });
  }
}
