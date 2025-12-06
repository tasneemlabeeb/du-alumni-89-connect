-- Create departments table and seed faculties/departments
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read departments (used for dropdowns)
CREATE POLICY "Public can select departments" ON public.departments
  FOR SELECT USING (true);

-- Allow admins to manage departments
CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert seed data (faculties + departments)
INSERT INTO public.departments (faculty, name, slug) VALUES
  ('Faculty of Arts', 'Faculty of Arts', 'faculty-of-arts'),
  ('Faculty of Arts', 'Department of Bengali', 'dept-bengali'),
  ('Faculty of Arts', 'Department of English', 'dept-english'),
  ('Faculty of Arts', 'Department of Arabic', 'dept-arabic'),
  ('Faculty of Arts', 'Department of Urdu and Persian', 'dept-urdu-persian'),
  ('Faculty of Arts', 'Department of Sanskrit and Pali', 'dept-sanskrit-pali'),
  ('Faculty of Arts', 'Department of History', 'dept-history'),
  ('Faculty of Arts', 'Department of Philosophy', 'dept-philosophy'),
  ('Faculty of Arts', 'Department of Islamic Studies', 'dept-islamic-studies'),
  ('Faculty of Arts', 'Department of Islamic History and Culture', 'dept-islamic-history-culture'),
  ('Faculty of Arts', 'Department of Library and Information Science', 'dept-library-info'),
  ('Faculty of Arts', 'Department of Mass Communication and Journalism', 'dept-mass-comm-journalism'),
  ('Faculty of Arts', 'Department of Drama and Music', 'dept-drama-music'),

  ('Faculty of Law', 'Faculty of Law', 'faculty-of-law'),
  ('Faculty of Law', 'Department of Law', 'dept-law'),

  ('Faculty of Social Sciences', 'Faculty of Social Sciences', 'faculty-of-social-sciences'),
  ('Faculty of Social Sciences', 'Department of Economics', 'dept-economics'),
  ('Faculty of Social Sciences', 'Department of Political Science', 'dept-political-science'),
  ('Faculty of Social Sciences', 'Department of International Relations', 'dept-international-relations'),
  ('Faculty of Social Sciences', 'Department of Sociology', 'dept-sociology'),
  ('Faculty of Social Sciences', 'Department of Public Administration', 'dept-public-administration'),

  ('Faculty of Science', 'Faculty of Science', 'faculty-of-science'),
  ('Faculty of Science', 'Department of Chemistry', 'dept-chemistry'),
  ('Faculty of Science', 'Department of Mathematics', 'dept-mathematics'),
  ('Faculty of Science', 'Department of Physics', 'dept-physics'),
  ('Faculty of Science', 'Department of Statistics', 'dept-statistics'),
  ('Faculty of Science', 'Department of Geography', 'dept-geography'),
  ('Faculty of Science', 'Department of Geology', 'dept-geology'),
  ('Faculty of Science', 'Department of Applied Physics and Electronics', 'dept-applied-physics-electronics'),
  ('Faculty of Science', 'Department of Applied Chemistry and Chemical Technology', 'dept-applied-chemistry-chemical-tech'),

  ('Faculty of Biological Sciences', 'Faculty of Biological Sciences', 'faculty-of-biological-sciences'),
  ('Faculty of Biological Sciences', 'Department of Soil, Water and Environment', 'dept-soil-water-environment'),
  ('Faculty of Biological Sciences', 'Department of Botany', 'dept-botany'),
  ('Faculty of Biological Sciences', 'Department of Zoology', 'dept-zoology'),
  ('Faculty of Biological Sciences', 'Department of Biochemistry', 'dept-biochemistry'),
  ('Faculty of Biological Sciences', 'Department of Pharmacy', 'dept-pharmacy'),
  ('Faculty of Biological Sciences', 'Department of Psychology', 'dept-psychology'),
  ('Faculty of Biological Sciences', 'Department of Microbiology', 'dept-microbiology'),

  ('Faculty of Business Studies', 'Faculty of Business Studies', 'faculty-of-business-studies'),
  ('Faculty of Business Studies', 'Department of Management', 'dept-management'),
  ('Faculty of Business Studies', 'Department of Accounting', 'dept-accounting'),
  ('Faculty of Business Studies', 'Department of Finance', 'dept-finance'),
  ('Faculty of Business Studies', 'Department of Marketing', 'dept-marketing')
;
