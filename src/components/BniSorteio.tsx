import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { membersData } from '@/data/membersData';
import { Download, Upload, Users } from 'lucide-react';

export function BniSorteio() {
  const [pptxFile, setPptxFile] = useState<File | null>(null);
  const [palestrante1, setPalestrante1] = useState<string>('');
  const [palestrante2, setPalestrante2] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.pptx')) {
      setPptxFile(file);
      toast({
        title: 'Arquivo carregado',
        description: `${file.name} foi selecionado com sucesso.`,
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo .pptx válido.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pptxFile) {
      toast({
        title: 'Erro',
        description: 'Por favor, faça upload da apresentação anterior.',
        variant: 'destructive',
      });
      return;
    }

    if (!palestrante1 || !palestrante2) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione ambos os palestrantes.',
        variant: 'destructive',
      });
      return;
    }

    if (palestrante1 === palestrante2) {
      toast({
        title: 'Erro',
        description: 'Os palestrantes devem ser pessoas diferentes.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Sorteio realizado!',
      description: 'Os arquivos estão prontos para download.',
    });
    setShowResults(true);
  };

  const sortableMembers = membersData.filter(member => 
    ![8, 86, 87, 88, 89].includes(member.cadeira)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            Sistema de Sorteio BNI
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerador de ordem de apresentação para reuniões semanais
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" />
              Configuração do Sorteio
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Preencha os dados abaixo para gerar a nova ordem de apresentação
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="pptx_anterior" className="text-base font-semibold">
                  1. Upload da Apresentação Anterior (.pptx)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="pptx_anterior"
                    name="pptx_anterior"
                    type="file"
                    accept=".pptx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
                {pptxFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {pptxFile.name}
                  </p>
                )}
              </div>

              {/* Speaker 1 */}
              <div className="space-y-2">
                <Label htmlFor="palestrante1" className="text-base font-semibold">
                  2. Selecione o Palestrante 1
                </Label>
                <Select value={palestrante1} onValueChange={setPalestrante1}>
                  <SelectTrigger id="palestrante1" name="palestrante1">
                    <SelectValue placeholder="Escolha o primeiro palestrante" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {sortableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.nome}>
                        {member.nome} - {member.empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Speaker 2 */}
              <div className="space-y-2">
                <Label htmlFor="palestrante2" className="text-base font-semibold">
                  3. Selecione o Palestrante 2
                </Label>
                <Select value={palestrante2} onValueChange={setPalestrante2}>
                  <SelectTrigger id="palestrante2" name="palestrante2">
                    <SelectValue placeholder="Escolha o segundo palestrante" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {sortableMembers.map((member) => (
                      <SelectItem 
                        key={member.id} 
                        value={member.nome}
                        disabled={member.nome === palestrante1}
                      >
                        {member.nome} - {member.empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full text-lg py-6" size="lg">
                Sortear Empresários
              </Button>
            </form>
          </CardContent>
        </Card>

        {showResults && (
          <Card className="mt-6 shadow-lg border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl text-primary">
                Sorteio Realizado com Sucesso!
              </CardTitle>
              <CardDescription>
                Faça o download dos arquivos gerados abaixo
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <Button variant="outline" className="w-full justify-start" size="lg" asChild>
                <a href="#" download>
                  <Download className="mr-2 h-5 w-5" />
                  Baixar Planilha de Ordem (CSV)
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg" asChild>
                <a href="#" download>
                  <Download className="mr-2 h-5 w-5" />
                  Baixar Nova Apresentação (PPTX)
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg" asChild>
                <a href="#" download>
                  <Download className="mr-2 h-5 w-5" />
                  Baixar Novo Mapa de Assentos (PDF)
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
