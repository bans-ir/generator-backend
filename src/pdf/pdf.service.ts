import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reshaper = require('arabic-persian-reshaper');

@Injectable()
export class PdfService {
  async generatePdfToFile(amount: number, fileName: string): Promise<string> {
    const pdfPath = path.join(__dirname, `../../public/pdfs/${fileName}`);
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

    const companyName = reshaper.PersianShaper.convertArabic('بن شرکت');
    const description = reshaper.PersianShaper.convertArabic(
      'شما توسط شده وارد مقدار گزارش',
    );
    const valueText = reshaper.PersianShaper.convertArabic(`${amount} وات`);

    // طراحی مشابه قبل
    const primaryColor = '#203933';
    const lightGray = '#F5F5F5';

    doc.rect(0, 25, doc.page.width, 80).fill(primaryColor);
    doc.fillColor('white').fontSize(22).text(companyName, {
      align: 'center',
    });

    doc.moveDown(2);
    doc.fillColor('black');
    doc.fontSize(14).text(description, { align: 'right' });

    doc.moveDown(0.5);
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(2);
    const boxWidth = doc.page.width - 100;
    const boxX = 50;
    const boxY = doc.y;

    doc.rect(boxX, boxY, boxWidth, 60).fill(lightGray);
    doc
      .fillColor('black')
      .fontSize(18)
      .text(valueText, boxX + 20, boxY + 20, {
        align: 'right',
        width: boxWidth - 40,
      });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(`/pdfs/${fileName}`));
      stream.on('error', reject);
    });
  }
}
