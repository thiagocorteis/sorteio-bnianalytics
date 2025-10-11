import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Users, Loader2, Trash2 } from 'lucide-react';
import Papa from 'papaparse';

// Definindo a interface para os membros
interface Member {
  id?: string;
  nome_membro: string;
  nome_empresa: string;
  cargo_id: string | null;
  cadeira_fixa: boolean;
  numero_cadeira_fixa: number | null;
}

interface Cargo {
  id: string;
  cargo: string;
}

export function CadastroMembros() {
  const [members, setMembers] = useState<Member[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Função para buscar membros e cargos do Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: membersData, error: membersError } = await supabase.from('membros').select('*');
      if (membersError) throw membersError;
      setMembers(membersData || []);

      const { data: cargosData, error: cargosError } = await supabase.from('cargos').select('*');
      if (cargosError) throw cargosError;
      setCargos(cargosData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível buscar os membros e cargos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({ title: 'Nenhum arquivo selecionado', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    // Criar um mapa de nomes de cargos para IDs para facilitar a busca
    const cargoNameToIdMap = new Map(cargos.map(cargo => [cargo.cargo.toLowerCase(), cargo.id]));
    const defaultCargo = cargos.find(c => c.cargo.toLowerCase() === 'membro');
    const defaultCargoId = defaultCargo ? defaultCargo.id : null;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),
      complete: async (results) => {
        const newMembers: Omit<Member, 'id'>[] = results.data
          .map((row: any) => {
            const nomeMembro = row['Nome'] || row['nome_membro'];
            const nomeEmpresa = row['Empresa'] || row['nome_empresa'];
            const cargoNome = (row['Cargo'] || row['cargo'] || 'Membro').toLowerCase();

            if (!nomeMembro || !nomeEmpresa) {
              return null;
            }
            
            // Encontrar o ID do cargo, ou usar o padrão se não encontrar
            const cargo_id = cargoNameToIdMap.get(cargoNome) || defaultCargoId;

            return {
              nome_membro: nomeMembro.trim(),
              nome_empresa: nomeEmpresa.trim(),
              cargo_id: cargo_id,
              cadeira_fixa: false,
              numero_cadeira_fixa: null,
            };
          })
          .filter((member): member is Member => member !== null);

        if (newMembers.length > 0) {
          const { error } = await supabase.from('membros').upsert(
            newMembers.map(m => ({
              nome_membro: m.nome_membro,
              nome_empresa: m.nome_empresa,
              cargo_id: m.cargo_id,
            })),
            { onConflict: 'nome_membro' } // Atualiza se o nome do membro já existir
          );

          if (error) {
            console.error('Erro ao importar membros:', error);
            toast({ title: 'Erro ao importar planilha', description: error.message, variant: 'destructive' });
          } else {
            toast({ title: 'Sucesso!', description: `${newMembers.length} membros foram importados.` });
            fetchData(); // Recarregar a lista
          }
        } else {
          toast({ title: 'Nenhum membro válido encontrado no arquivo.', variant: 'destructive' });
        }
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Erro ao parsear CSV:', error);
        toast({ title: 'Erro ao ler o arquivo', description: error.message, variant: 'destructive' });
        setIsLoading(false);
      }
    });
  };

  const handleMemberUpdate = async (member: Member, field: keyof Member, value: any) => {
      const updatedMembers = members.map(m => m.id === member.id ? { ...m, [field]: value } : m);
      setMembers(updatedMembers);

      const { error } = await supabase.from('membros').update({ [field]: value }).eq('id', member.id);
      if (error) {
          toast({ title: 'Erro ao atualizar membro', description: error.message, variant: 'destructive' });
          fetchData(); // Reverte para o estado do banco de dados em caso de erro
      }
  };

  const handleDeleteMember = async (memberId: string) => {
      if (!confirm('Tem certeza que deseja excluir este membro?')) return;
      
      const { error } = await supabase.from('membros').delete().eq('id', memberId);
      if (error) {
          toast({ title: 'Erro ao excluir membro', description: error.message, variant: 'destructive' });
      } else {
          toast({ title: 'Membro excluído com sucesso!' });
          setMembers(members.filter(m => m.id !== memberId));
      }
  };


  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6" />
            Cadastro de Membros
          </CardTitle>
          <CardDescription>
            Gerencie os membros da sua equipe BNI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <Label className="text-base font-semibold">Importar Membros</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".csv, .txt, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />
              <Button onClick={handleFileUpload} disabled={isLoading || !file}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Upload className="h-5 w-5" />}
                <span className="ml-2">Importar</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Envie um arquivo CSV, TXT ou Excel com as colunas: "Nome", "Empresa", e "Cargo".
            </p>
          </div>

          <div className="mt-8">
             <h3 className="text-lg font-semibold mb-4">Membros Cadastrados</h3>
             {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome do Membro</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead className="text-center">Cadeira Fixa</TableHead>
                            <TableHead className="text-center">Número</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.nome_membro}</TableCell>
                                <TableCell>{member.nome_empresa}</TableCell>
                                <TableCell>
                                    <Select
                                        value={member.cargo_id || ''}
                                        onValueChange={(newCargoId) => handleMemberUpdate(member, 'cargo_id', newCargoId)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cargos.map((cargo) => (
                                                <SelectItem key={cargo.id} value={cargo.id}>
                                                    {cargo.cargo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={member.cadeira_fixa}
                                        onCheckedChange={(checked) => handleMemberUpdate(member, 'cadeira_fixa', checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {member.cadeira_fixa && (
                                        <Input
                                            type="number"
                                            className="w-20 mx-auto"
                                            value={member.numero_cadeira_fixa || ''}
                                            onChange={(e) => handleMemberUpdate(member, 'numero_cadeira_fixa', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id!)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
