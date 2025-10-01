import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Cargo {
  id: string;
  cargo: string;
  descricao: string | null;
}

export default function CadastroCargos() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [novoCargo, setNovoCargo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  useEffect(() => {
    loadCargos();
  }, []);

  const loadCargos = async () => {
    try {
      const { data, error } = await supabase
        .from("cargos")
        .select("*")
        .order("cargo");

      if (error) throw error;
      setCargos(data || []);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cargos.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("cargos").insert({
        cargo: novoCargo,
        descricao: novaDescricao || null,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Cargo adicionado com sucesso.",
      });

      setNovoCargo("");
      setNovaDescricao("");
      loadCargos();
    } catch (error) {
      console.error("Erro ao adicionar cargo:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar cargo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Cargos</CardTitle>
          <CardDescription>
            Adicione e gerencie os cargos dos membros da equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={novoCargo}
                onChange={(e) => setNovoCargo(e.target.value)}
                placeholder="Ex: Contador"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Ex: Serviços de contabilidade"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar Cargo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cargos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    Nenhum cargo cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                cargos.map((cargo) => (
                  <TableRow key={cargo.id}>
                    <TableCell className="font-medium">{cargo.cargo}</TableCell>
                    <TableCell>{cargo.descricao || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
