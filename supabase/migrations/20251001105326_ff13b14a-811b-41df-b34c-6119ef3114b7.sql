-- Create equipes_bni table
CREATE TABLE public.equipes_bni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_equipe TEXT NOT NULL,
  url_logotipo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create cargos table
CREATE TABLE public.cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo TEXT NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create membros table
CREATE TABLE public.membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_membro TEXT NOT NULL,
  nome_empresa TEXT NOT NULL,
  cargo_id UUID REFERENCES public.cargos(id),
  cadeira_fixa BOOLEAN DEFAULT false,
  numero_cadeira_fixa INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equipes_bni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this app)
CREATE POLICY "Allow public read access to equipes_bni" ON public.equipes_bni FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to equipes_bni" ON public.equipes_bni FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to equipes_bni" ON public.equipes_bni FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to cargos" ON public.cargos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to cargos" ON public.cargos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to cargos" ON public.cargos FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to membros" ON public.membros FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to membros" ON public.membros FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to membros" ON public.membros FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to membros" ON public.membros FOR DELETE USING (true);

-- Insert initial cargos data
INSERT INTO public.cargos (cargo, descricao) VALUES
  ('Presidente', 'Responsável pela liderança geral da equipe'),
  ('Vice-Presidente', 'Auxilia o presidente nas atividades'),
  ('Secretário', 'Gerencia documentação e comunicações'),
  ('Tesoureiro', 'Administra finanças da equipe'),
  ('Diretor de Visitantes', 'Coordena recepção de visitantes'),
  ('Membro', 'Membro regular da equipe BNI');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_equipes_bni_updated_at BEFORE UPDATE ON public.equipes_bni
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_membros_updated_at BEFORE UPDATE ON public.membros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();