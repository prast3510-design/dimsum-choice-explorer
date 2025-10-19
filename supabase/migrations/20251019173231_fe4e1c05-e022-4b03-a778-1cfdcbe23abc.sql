-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create criteria table
CREATE TABLE public.criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  weight DECIMAL(10, 4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create variants table (varian dimsum)
CREATE TABLE public.variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create comparisons table (perbandingan berpasangan AHP)
CREATE TABLE public.comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  criterion1_id UUID REFERENCES public.criteria(id) ON DELETE CASCADE NOT NULL,
  criterion2_id UUID REFERENCES public.criteria(id) ON DELETE CASCADE NOT NULL,
  comparison_value DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, criterion1_id, criterion2_id)
);

-- Create variant_scores table (nilai varian per kriteria)
CREATE TABLE public.variant_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE NOT NULL,
  criterion_id UUID REFERENCES public.criteria(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, variant_id, criterion_id)
);

-- Create results table (hasil perhitungan AHP)
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE NOT NULL,
  final_score DECIMAL(10, 4) NOT NULL,
  ranking INTEGER NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, variant_id, calculated_at)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for criteria
CREATE POLICY "Everyone can view active criteria"
  ON public.criteria FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert criteria"
  ON public.criteria FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update criteria"
  ON public.criteria FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete criteria"
  ON public.criteria FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for variants
CREATE POLICY "Everyone can view active variants"
  ON public.variants FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert variants"
  ON public.variants FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update variants"
  ON public.variants FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete variants"
  ON public.variants FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for comparisons
CREATE POLICY "Users can view their own comparisons"
  ON public.comparisons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comparisons"
  ON public.comparisons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comparisons"
  ON public.comparisons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all comparisons"
  ON public.comparisons FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for variant_scores
CREATE POLICY "Users can view their own scores"
  ON public.variant_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores"
  ON public.variant_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores"
  ON public.variant_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores"
  ON public.variant_scores FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for results
CREATE POLICY "Users can view their own results"
  ON public.results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON public.results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all results"
  ON public.results FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_criteria_updated_at
  BEFORE UPDATE ON public.criteria
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variants_updated_at
  BEFORE UPDATE ON public.variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variant_scores_updated_at
  BEFORE UPDATE ON public.variant_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign customer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default criteria (for AHP)
INSERT INTO public.criteria (name, description, is_active) VALUES
  ('Rasa', 'Tingkat kelezatan dan kenikmatan rasa dimsum', true),
  ('Harga', 'Kesesuaian harga dengan kualitas produk', true),
  ('Tekstur', 'Kualitas tekstur dimsum (lembut, kenyal, dll)', true),
  ('Aroma', 'Aroma yang dihasilkan dimsum', true),
  ('Penyajian', 'Tampilan dan cara penyajian dimsum', true),
  ('Kesehatan', 'Nilai gizi dan kesehatan bahan dimsum', true);

-- Insert sample dimsum variants
INSERT INTO public.variants (name, description, price, is_active) VALUES
  ('Hakao Udang', 'Dimsum hakao isi udang segar dengan kulit tipis transparan', 25000, true),
  ('Siomay Ayam', 'Siomay isi ayam cincang dengan bumbu khas', 22000, true),
  ('Lumpia Sayur', 'Lumpia goreng isi sayuran segar dan jamur', 20000, true),
  ('Pangsit Goreng', 'Pangsit goreng crispy isi daging babi dan udang', 28000, true),
  ('Bapao Isi Ayam', 'Bakpao kukus lembut isi ayam berbumbu', 18000, true),
  ('Dimsum Kepiting', 'Dimsum premium isi kepiting dan telur ikan', 35000, true);