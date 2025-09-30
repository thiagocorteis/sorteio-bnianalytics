import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Member {
  id: number;
  nome: string;
  empresa: string;
  atividade: string;
  cadeira: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const palestrante1 = formData.get('palestrante1') as string;
    const palestrante2 = formData.get('palestrante2') as string;
    
    console.log('Recebido:', { palestrante1, palestrante2 });

    // Dados dos membros
    const membersData: Member[] = [
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
    ];

    const fixedSeats = [8, 86, 87, 88, 89];
    
    // Separar membros fixos e sorteaveis
    const fixedMembers = membersData.filter(m => fixedSeats.includes(m.cadeira));
    const sortableMembers = membersData.filter(m => !fixedSeats.includes(m.cadeira));
    
    // Encontrar os palestrantes
    const speaker1 = sortableMembers.find(m => m.nome === palestrante1);
    const speaker2 = sortableMembers.find(m => m.nome === palestrante2);
    
    if (!speaker1 || !speaker2) {
      throw new Error('Palestrantes não encontrados');
    }

    // Remover palestrantes da lista de sorteaveis
    const remainingMembers = sortableMembers.filter(
      m => m.nome !== palestrante1 && m.nome !== palestrante2
    );

    // Randomizar membros restantes
    const shuffled = [...remainingMembers].sort(() => Math.random() - 0.5);

    // Montar nova ordem
    const newOrder: Member[] = [];
    let shuffledIndex = 0;

    // Distribuir membros nas cadeiras de 1 a 20
    for (let cadeira = 1; cadeira <= 20; cadeira++) {
      if (cadeira === 8) {
        // Cadeira fixa 8
        const fixedMember = fixedMembers.find(m => m.cadeira === 8);
        if (fixedMember) {
          newOrder.push({ ...fixedMember, cadeira });
        }
      } else {
        // Atribuir próximo membro randomizado
        if (shuffledIndex < shuffled.length) {
          newOrder.push({ ...shuffled[shuffledIndex], cadeira });
          shuffledIndex++;
        }
      }
    }

    // Adicionar palestrantes nas posições 86 e 87
    newOrder.push({ ...speaker1, cadeira: 86 });
    newOrder.push({ ...speaker2, cadeira: 87 });

    // Adicionar demais membros fixos (88, 89)
    for (const seat of [88, 89]) {
      const fixedMember = fixedMembers.find(m => m.cadeira === seat);
      if (fixedMember) {
        newOrder.push({ ...fixedMember, cadeira: seat });
      }
    }

    // Gerar CSV
    const csvHeader = 'Cadeira,Nome do Membro,Empresa,Referência Pedida\n';
    const csvRows = newOrder.map(m => 
      `${m.cadeira},"${m.nome}","${m.empresa}","${m.atividade}"`
    ).join('\n');
    const csvContent = csvHeader + csvRows;

    return new Response(
      JSON.stringify({
        success: true,
        csv: csvContent,
        order: newOrder
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro no sorteio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
