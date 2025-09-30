import PptxGenJS from 'pptxgenjs';

interface Member {
  id: number;
  nome: string;
  empresa: string;
  atividade: string;
  cadeira: number;
}

export const generatePresentationPPTX = async (members: Member[]): Promise<Blob> => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Sistema BNI';
  pptx.title = 'Apresentação BNI';

  // Slide de título
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '002E5D' };
  titleSlide.addText('Ordem de Apresentação BNI', {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  titleSlide.addText(new Date().toLocaleDateString('pt-BR'), {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.5,
    fontSize: 24,
    color: 'FFFFFF',
    align: 'center',
  });

  // Slide para cada membro
  for (const member of members) {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };
    
    // Header azul
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 1.2,
      fill: { color: '002E5D' },
    });
    
    // Número da cadeira
    slide.addText(`CADEIRA ${member.cadeira}`, {
      x: 0.5,
      y: 0.3,
      w: 2,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: 'FFFFFF',
    });

    // Nome do membro
    slide.addText(member.nome, {
      x: 1,
      y: 2,
      w: 8,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: '002E5D',
      align: 'center',
    });

    // Empresa
    slide.addText(member.empresa, {
      x: 1,
      y: 3,
      w: 8,
      h: 0.6,
      fontSize: 28,
      color: '333333',
      align: 'center',
    });

    // Atividade
    slide.addText(member.atividade, {
      x: 1,
      y: 4,
      w: 8,
      h: 0.5,
      fontSize: 20,
      color: '666666',
      align: 'center',
      italic: true,
    });
  }

  // Gerar o arquivo como blob
  const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;
  return pptxBlob;
};
