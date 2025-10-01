import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function CadastroBni() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [equipeId, setEquipeId] = useState<string | null>(null);
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadEquipeData();
  }, []);

  const loadEquipeData = async () => {
    try {
      const { data, error } = await supabase
        .from("equipes_bni")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEquipeId(data.id);
        setNomeEquipe(data.nome_equipe);
        setLogoUrl(data.url_logotipo);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da equipe:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalLogoUrl = logoUrl;

      // Upload do logo se houver arquivo
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("equipe-logos")
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("equipe-logos")
          .getPublicUrl(filePath);

        finalLogoUrl = publicUrl;
      }

      // Inserir ou atualizar equipe
      if (equipeId) {
        const { error } = await supabase
          .from("equipes_bni")
          .update({
            nome_equipe: nomeEquipe,
            url_logotipo: finalLogoUrl,
          })
          .eq("id", equipeId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("equipes_bni")
          .insert({
            nome_equipe: nomeEquipe,
            url_logotipo: finalLogoUrl,
          })
          .select()
          .single();

        if (error) throw error;
        setEquipeId(data.id);
      }

      setLogoUrl(finalLogoUrl);
      toast({
        title: "Sucesso!",
        description: "Dados da equipe salvos com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar equipe:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados da equipe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro da Equipe BNI</CardTitle>
          <CardDescription>
            Configure o nome e o logotipo da sua equipe BNI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Equipe</Label>
              <Input
                id="nome"
                value={nomeEquipe}
                onChange={(e) => setNomeEquipe(e.target.value)}
                placeholder="Ex: BNI Alfa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logotipo</Label>
              {logoUrl && (
                <div className="mb-2">
                  <img
                    src={logoUrl}
                    alt="Logo da equipe"
                    className="h-20 object-contain"
                  />
                </div>
              )}
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
