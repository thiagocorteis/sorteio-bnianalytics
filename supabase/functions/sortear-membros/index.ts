import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Member {
  cadeira: number;
  nome: string;
  empresa: string;
  atividade: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const palestrante1 = formData.get('palestrante1') as string;
    const palestrante2 = formData.get('palestrante2') as string;
    
    console.log('Recebido:', { palestrante1, palestrante2 });

    // Buscar membros do banco de dados
    const { data: membrosData, error: membrosError } = await supabase
      .from('membros')
      .select(`
        id,
        nome_membro,
        nome_empresa,
        cadeira_fixa,
        numero_cadeira_fixa,
        cargos (
          descricao
        )
      `);

    if (membrosError) {
      throw new Error(`Erro ao buscar membros: ${membrosError.message}`);
    }

    if (!membrosData || membrosData.length === 0) {
      throw new Error('Nenhum membro encontrado no banco de dados');
    }

    // Separar membros com cadeira fixa e sorteaveis
    const fixedMembers = membrosData.filter(m => m.cadeira_fixa && m.numero_cadeira_fixa);
    const sortableMembers = membrosData.filter(m => !m.cadeira_fixa);
    
    // Encontrar os palestrantes
    const speaker1 = sortableMembers.find(m => m.nome_membro === palestrante1);
    const speaker2 = sortableMembers.find(m => m.nome_membro === palestrante2);
    
    if (!speaker1 || !speaker2) {
      throw new Error('Palestrantes não encontrados');
    }

    // Remover palestrantes da lista de sorteaveis
    const remainingMembers = sortableMembers.filter(
      m => m.nome_membro !== palestrante1 && m.nome_membro !== palestrante2
    );

    // Randomizar membros restantes
    const shuffled = [...remainingMembers].sort(() => Math.random() - 0.5);

    // Total de membros para determinar número de cadeiras
    const totalMembers = membrosData.length;
    const newOrder: Member[] = [];
    let shuffledIndex = 0;

    // Criar array de cadeiras disponíveis (excluindo 86 e 87 para palestrantes)
    const availableSeats: number[] = [];
    for (let i = 1; i <= totalMembers; i++) {
      if (i !== 86 && i !== 87) {
        availableSeats.push(i);
      }
    }

    // Primeiro, alocar membros com cadeira fixa
    for (const fixedMember of fixedMembers) {
      if (fixedMember.numero_cadeira_fixa) {
        const seatIndex = availableSeats.indexOf(fixedMember.numero_cadeira_fixa);
        if (seatIndex > -1) {
          availableSeats.splice(seatIndex, 1); // Remover cadeira ocupada
        }
        newOrder.push({
          cadeira: fixedMember.numero_cadeira_fixa,
          nome: fixedMember.nome_membro,
          empresa: fixedMember.nome_empresa,
          atividade: fixedMember.cargos?.descricao || '',
        });
      }
    }

    // Distribuir membros embaralhados nas cadeiras restantes
    for (const seat of availableSeats) {
      if (shuffledIndex < shuffled.length) {
        const member = shuffled[shuffledIndex];
        newOrder.push({
          cadeira: seat,
          nome: member.nome_membro,
          empresa: member.nome_empresa,
          atividade: member.cargos?.descricao || '',
        });
        shuffledIndex++;
      }
    }

    // Adicionar palestrantes nas posições 86 e 87
    newOrder.push({
      cadeira: 86,
      nome: speaker1.nome_membro,
      empresa: speaker1.nome_empresa,
      atividade: speaker1.cargos?.descricao || '',
    });
    newOrder.push({
      cadeira: 87,
      nome: speaker2.nome_membro,
      empresa: speaker2.nome_empresa,
      atividade: speaker2.cargos?.descricao || '',
    });

    // Ordenar por número de cadeira
    newOrder.sort((a, b) => a.cadeira - b.cadeira);

    console.log('Sorteio concluído com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
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
