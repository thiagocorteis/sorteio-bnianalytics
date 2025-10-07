import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Membro {
  id: string;
  nome_membro: string;
  nome_empresa: string;
  cadeira_fixa: boolean;
  numero_cadeira_fixa: number | null;
  cargo_id: string | null;
  cargos: { cargo: string } | null;
}

interface Cargo {
  id: string;
  cargo: string;
}

export default function CadastroMembros() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membrosResult, cargosResult] = await Promise.all([
        supabase.from("membros").select("*, cargos(cargo)").order("nome_membro"),
        supabase.from("cargos").select("*").order("cargo"),
      ]);

      if (membrosResult.error) throw membrosResult.error;
      if (cargosResult.error) throw cargosResult.error;

      setMembros(membrosResult.data || []);
      setCargos(cargosResult.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[,;\t]/);
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || "";
      });
      data.push(obj);
    }

    return data;
  };

  const parseExcel = async (file: File): Promise<any[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    if (jsonData.length < 2) return [];

    const headers = (jsonData[0] as any[]).map((h: any) => 
      String(h).trim().toLowerCase()
    );
    const data = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] ? String(row[index]).trim() : "";
      });
      if (obj[headers[0]]) { // Only add rows with data in first column
        data.push(obj);
      }
    }

    return data;
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      let rows: any[] = [];
      
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      
      if (isExcel) {
        rows = await parseExcel(file);
      } else {
        const text = await file.text();
        rows = parseCSV(text);
      }

      if (rows.length === 0) {
        throw new Error("Arquivo vazio ou formato inválido");
      }

      // Get default "Membro" cargo ID
      const { data: defaultCargo } = await supabase
        .from("cargos")
        .select("id")
        .eq("cargo", "Membro")
        .single();

      const defaultCargoId = defaultCargo?.id || null;

      // Map cargo names to IDs
      const membrosToInsert = await Promise.all(
        rows.map(async (row) => {
          let cargoId = defaultCargoId;
          
          // If cargo column exists in CSV, try to find matching cargo
          const cargoName = row.cargo || row.role || "";
          if (cargoName) {
            const { data: cargo } = await supabase
              .from("cargos")
              .select("id")
              .ilike("cargo", cargoName)
              .single();
            
            if (cargo) {
              cargoId = cargo.id;
            }
          }

          return {
            nome_membro: row.nome || row.name || "",
            nome_empresa: row.empresa || row.company || "",
            cadeira_fixa: false,
            numero_cadeira_fixa: null,
            cargo_id: cargoId,
          };
        })
      );

      const { error } = await supabase.from("membros").insert(membrosToInsert);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `${membrosToInsert.length} membros importados com sucesso.`,
      });

      setFile(null);
      loadData();
    } catch (error) {
      console.error("Erro ao importar membros:", error);
      toast({
        title: "Erro",
        description: "Erro ao importar membros. Verifique o formato do arquivo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMembro = async (
    id: string,
    field: string,
    value: any
  ) => {
    try {
      const { error } = await supabase
        .from("membros")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error("Erro ao atualizar membro:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar membro.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Membros</CardTitle>
          <CardDescription>
            Faça upload de um arquivo CSV, TXT ou Excel com os dados dos membros.
            O arquivo deve conter as colunas: nome, empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>

            <Button type="submit" disabled={loading || !file}>
              {loading ? "Importando..." : "Importar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membros Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Cadeira Fixa</TableHead>
                  <TableHead>Número</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum membro cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  membros.map((membro) => (
                    <TableRow key={membro.id}>
                      <TableCell className="font-medium">{membro.nome_membro}</TableCell>
                      <TableCell>{membro.nome_empresa}</TableCell>
                      <TableCell>
                        <Select
                          value={membro.cargo_id || "none"}
                          onValueChange={(value) =>
                            updateMembro(membro.id, "cargo_id", value === "none" ? null : value)
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {cargos.filter(c => c.id).map((cargo) => (
                              <SelectItem key={cargo.id} value={cargo.id}>
                                {cargo.cargo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={membro.cadeira_fixa}
                          onCheckedChange={(checked) =>
                            updateMembro(membro.id, "cadeira_fixa", checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {membro.cadeira_fixa && (
                          <Input
                            type="number"
                            className="w-20"
                            value={membro.numero_cadeira_fixa || ""}
                            onChange={(e) =>
                              updateMembro(
                                membro.id,
                                "numero_cadeira_fixa",
                                parseInt(e.target.value) || null
                              )
                            }
                            min="1"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
