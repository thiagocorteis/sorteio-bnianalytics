export interface Member {
  id: number;
  nome: string;
  empresa: string;
  atividade: string;
  cadeira: number;
}

export const membersData: Member[] = [
  { id: 1, nome: 'VERONICA SOARES', empresa: 'AUDITIVE APARELHOS AUDITIVOS', atividade: 'Aparelhos auditivos e CPAP', cadeira: 1 },
  { id: 2, nome: 'CARINE MENDES', empresa: 'DESIGN DE INTERIORES', atividade: 'Design de Interiores', cadeira: 2 },
  { id: 3, nome: 'JOSE CARLOS SILVA', empresa: 'ADVOCACIA EMPRESARIAL', atividade: 'Advocacia Empresarial', cadeira: 3 },
  { id: 4, nome: 'MARIA FERNANDA COSTA', empresa: 'CONTABILIDADE ESTRATÉGICA', atividade: 'Contabilidade', cadeira: 4 },
  { id: 5, nome: 'ROBERTO ALMEIDA', empresa: 'SEGUROS EMPRESARIAIS', atividade: 'Seguros', cadeira: 5 },
  { id: 6, nome: 'PATRICIA SANTOS', empresa: 'MARKETING DIGITAL', atividade: 'Marketing Digital', cadeira: 6 },
  { id: 7, nome: 'FERNANDO OLIVEIRA', empresa: 'ENGENHARIA CIVIL', atividade: 'Engenharia', cadeira: 7 },
  { id: 8, nome: 'JULIANA MARTINS', empresa: 'RECURSOS HUMANOS', atividade: 'RH', cadeira: 8 },
  { id: 9, nome: 'CARLOS EDUARDO LIMA', empresa: 'TECNOLOGIA DA INFORMAÇÃO', atividade: 'TI', cadeira: 9 },
  { id: 10, nome: 'AMANDA RODRIGUES', empresa: 'ARQUITETURA COMERCIAL', atividade: 'Arquitetura', cadeira: 10 },
  { id: 11, nome: 'RAFAEL PEREIRA', empresa: 'CONSULTORIA FINANCEIRA', atividade: 'Finanças', cadeira: 11 },
  { id: 12, nome: 'LUCIANA BARBOSA', empresa: 'IMOBILIÁRIA PREMIUM', atividade: 'Imóveis', cadeira: 12 },
  { id: 13, nome: 'MARCELO CARVALHO', empresa: 'GRÁFICA DIGITAL', atividade: 'Gráfica', cadeira: 13 },
  { id: 14, nome: 'DANIELA SOUZA', empresa: 'EVENTOS CORPORATIVOS', atividade: 'Eventos', cadeira: 14 },
  { id: 15, nome: 'GUSTAVO FERNANDES', empresa: 'ENERGIA SOLAR', atividade: 'Energia Renovável', cadeira: 15 },
  { id: 16, nome: 'BEATRIZ COSTA', empresa: 'NUTRIÇÃO FUNCIONAL', atividade: 'Nutrição', cadeira: 16 },
  { id: 17, nome: 'RICARDO AZEVEDO', empresa: 'ADVOCACIA TRABALHISTA', atividade: 'Direito Trabalhista', cadeira: 17 },
  { id: 18, nome: 'CAMILA NOGUEIRA', empresa: 'COACHING EXECUTIVO', atividade: 'Coaching', cadeira: 18 },
  { id: 19, nome: 'THIAGO RIBEIRO', empresa: 'SEGURANÇA ELETRÔNICA', atividade: 'Segurança', cadeira: 19 },
  { id: 20, nome: 'VANESSA MENDES', empresa: 'ESTÉTICA AVANÇADA', atividade: 'Estética', cadeira: 20 },
  { id: 86, nome: 'PALESTRANTE 1', empresa: 'EMPRESA PALESTRANTE 1', atividade: 'Palestrante', cadeira: 86 },
  { id: 87, nome: 'PALESTRANTE 2', empresa: 'EMPRESA PALESTRANTE 2', atividade: 'Palestrante', cadeira: 87 },
  { id: 88, nome: 'MEMBRO FIXO 88', empresa: 'EMPRESA FIXA 88', atividade: 'Posição Fixa', cadeira: 88 },
  { id: 89, nome: 'MEMBRO FIXO 89', empresa: 'EMPRESA FIXA 89', atividade: 'Posição Fixa', cadeira: 89 },
];

export const fixedSeats = [8, 86, 87, 88, 89];
