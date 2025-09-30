import { jsPDF } from 'jspdf';

interface Member {
  id: number;
  nome: string;
  empresa: string;
  atividade: string;
  cadeira: number;
}

export const generateSeatingMapPDF = (members: Member[]): string => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Título
  pdf.setFillColor(0, 46, 93);
  pdf.rect(0, 0, 297, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('Mapa de Assentos BNI', 148.5, 20, { align: 'center' });

  // Data
  pdf.setFontSize(12);
  pdf.text(new Date().toLocaleDateString('pt-BR'), 148.5, 27, { align: 'center' });

  // Desenhar assentos em formato circular
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  
  const centerX = 148.5;
  const centerY = 120;
  const radius = 70;
  const totalSeats = 20;

  // Assentos principais (1-20) em círculo
  for (let i = 0; i < totalSeats; i++) {
    const angle = (i * 2 * Math.PI) / totalSeats - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const member = members.find(m => m.cadeira === i + 1);
    if (member) {
      // Círculo do assento
      pdf.setFillColor(0, 46, 93);
      pdf.circle(x, y, 8, 'F');
      
      // Número da cadeira
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(String(member.cadeira), x, y + 1, { align: 'center' });
      
      // Nome (fora do círculo)
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      const nameX = centerX + (radius + 20) * Math.cos(angle);
      const nameY = centerY + (radius + 20) * Math.sin(angle);
      pdf.text(member.nome, nameX, nameY, { 
        align: 'center',
        maxWidth: 30 
      });
    }
  }

  // Palestrantes (86, 87) na parte inferior
  const speakerY = 180;
  const speakers = [86, 87];
  speakers.forEach((seatNum, idx) => {
    const member = members.find(m => m.cadeira === seatNum);
    if (member) {
      const x = 70 + (idx * 80);
      
      // Retângulo destaque
      pdf.setFillColor(220, 53, 69);
      pdf.roundedRect(x - 25, speakerY - 8, 50, 20, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`PALESTRANTE ${idx + 1}`, x, speakerY, { align: 'center' });
      pdf.setFontSize(9);
      pdf.text(member.nome, x, speakerY + 6, { 
        align: 'center',
        maxWidth: 45 
      });
    }
  });

  // Legenda
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(8);
  pdf.text('Sistema de Sorteio BNI', 148.5, 205, { align: 'center' });

  return pdf.output('datauristring').split(',')[1];
};
