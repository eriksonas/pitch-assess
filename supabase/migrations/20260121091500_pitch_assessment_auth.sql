-- Pitch Assessment Platform Database Schema
-- Migration: 20260121091500_pitch_assessment_auth.sql
-- Purpose: Enable user accounts with assessment persistence and project organization

-- ============================================================================
-- TYPES
-- ============================================================================

CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.assessment_status AS ENUM ('processing', 'completed', 'failed');
CREATE TYPE public.domain_type AS ENUM ('biotech', 'photonics', 'electronics', 'medtech', 'deeptech');
CREATE TYPE public.audience_type AS ENUM ('startup-contest', 'tech-transfer', 'funding-agency', 'venture-capital', 'investor', 'customer');
CREATE TYPE public.language_code AS ENUM ('en', 'pl', 'de', 'lt');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- User Profiles (intermediary table for auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projects (for organizing assessments)
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Assessments (pitch submissions)
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT,
    domain public.domain_type NOT NULL,
    audience public.audience_type NOT NULL,
    language public.language_code NOT NULL,
    status public.assessment_status DEFAULT 'processing'::public.assessment_status,
    overall_score DECIMAL(3,1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Results (detailed analysis)
CREATE TABLE public.assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    overall_feedback TEXT,
    overall_strengths TEXT,
    overall_weaknesses TEXT,
    section_scores JSONB,
    strengths JSONB,
    improvements JSONB,
    recommendations JSONB,
    next_steps JSONB,
    detailed_analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_project_id ON public.assessments(project_id);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX idx_assessment_results_assessment_id ON public.assessment_results(assessment_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Trigger function to create user_profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
    );
    RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Projects Policies
CREATE POLICY "users_manage_own_projects"
ON public.projects
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Assessments Policies
CREATE POLICY "users_manage_own_assessments"
ON public.assessments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Assessment Results Policies
CREATE POLICY "users_view_own_assessment_results"
ON public.assessment_results
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assessments a
        WHERE a.id = assessment_results.assessment_id
        AND a.user_id = auth.uid()
    )
);

CREATE POLICY "users_create_own_assessment_results"
ON public.assessment_results
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.assessments a
        WHERE a.id = assessment_results.assessment_id
        AND a.user_id = auth.uid()
    )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to create user_profiles on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON public.assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- MOCK DATA
-- ============================================================================

DO $$
DECLARE
    demo_user_uuid UUID := gen_random_uuid();
    admin_user_uuid UUID := gen_random_uuid();
    project1_uuid UUID := gen_random_uuid();
    project2_uuid UUID := gen_random_uuid();
    assessment1_uuid UUID := gen_random_uuid();
    assessment2_uuid UUID := gen_random_uuid();
    assessment3_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users (trigger creates user_profiles automatically)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (demo_user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'demo@pitchassess.com', crypt('demo123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Demo User", "role": "user"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (admin_user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@pitchassess.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create projects
    INSERT INTO public.projects (id, user_id, name, description) VALUES
        (project1_uuid, demo_user_uuid, 'BioTech Innovations', 'Collection of biotechnology pitch assessments'),
        (project2_uuid, demo_user_uuid, 'Deep-Tech Ventures', 'Advanced technology pitch evaluations');

    -- Create assessments
    INSERT INTO public.assessments (id, user_id, project_id, file_name, domain, audience, language, status, overall_score, created_at) VALUES
        (assessment1_uuid, demo_user_uuid, project1_uuid, 'BioSensor_Pitch_Deck_v3.pdf', 'biotech'::public.domain_type, 'venture-capital'::public.audience_type, 'en'::public.language_code, 'completed'::public.assessment_status, 8.4, '2026-01-18T14:30:00'),
        (assessment2_uuid, demo_user_uuid, project2_uuid, 'Quantum_Computing_Presentation.pdf', 'deeptech'::public.domain_type, 'funding-agency'::public.audience_type, 'en'::public.language_code, 'completed'::public.assessment_status, 7.8, '2026-01-15T10:15:00'),
        (assessment3_uuid, demo_user_uuid, project1_uuid, 'MedTech_Innovation_Pitch.mp4', 'medtech'::public.domain_type, 'tech-transfer'::public.audience_type, 'en'::public.language_code, 'completed'::public.assessment_status, 8.9, '2026-01-12T16:45:00');

    -- Create assessment results for first assessment
    INSERT INTO public.assessment_results (assessment_id, overall_feedback, overall_strengths, overall_weaknesses, section_scores, strengths, improvements, recommendations, next_steps, detailed_analysis)
    VALUES (
        assessment1_uuid,
        'Your pitch demonstrates strong technical depth and clear problem articulation. The solution is well-explained with compelling evidence of market need.',
        'Clear problem definition, strong technical innovation, compelling market data',
        'Competitive differentiation, financial projections, team credentials',
        '[{"id": 1, "name": "Structure & Clarity", "description": "Logical flow and presentation organization", "score": 8.5}, {"id": 2, "name": "Problem Definition", "description": "Clarity and relevance of problem statement", "score": 9.0}, {"id": 3, "name": "Solution Description", "description": "Technical innovation and feasibility", "score": 8.7}]'::jsonb,
        '[{"id": 1, "title": "Exceptional Problem Articulation", "description": "Your pitch opens with a compelling problem statement backed by quantitative data.", "example": "Current biosensor systems face 40% accuracy limitations in early disease detection.", "impact": "High"}]'::jsonb,
        '[{"id": 1, "title": "Strengthen Competitive Analysis", "description": "The pitch lacks detailed comparison with existing solutions.", "suggestion": "Create a feature comparison table highlighting your unique advantages.", "example": "Our biosensor achieves 95% accuracy versus competitors at 60-70%.", "priority": "high"}]'::jsonb,
        '[{"id": 1, "title": "Develop Comprehensive Competitive Matrix", "description": "Create detailed comparison showing technology advantages across key dimensions.", "tags": ["Competitive Analysis", "Market Position", "High Priority"]}]'::jsonb,
        '[{"id": 1, "action": "Create competitive comparison matrix with 5+ key competitors", "details": "Include accuracy rates, cost per test, and deployment timeline"}]'::jsonb,
        '[{"id": 1, "title": "Structure & Clarity", "subtitle": "Presentation organization and flow", "icon": "LayoutGrid", "score": 8.5, "analysis": "Your pitch follows a logical structure with clear transitions between sections.", "strengths": ["Strong opening hook", "Logical flow", "Professional design"], "improvements": ["Add agenda slide", "Reduce text density"], "recommendations": ["Use more diagrams"]}]'::jsonb
    );

END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_profiles IS 'User profile information linked to auth.users';
COMMENT ON TABLE public.projects IS 'Projects for organizing pitch assessments';
COMMENT ON TABLE public.assessments IS 'Pitch assessment submissions';
COMMENT ON TABLE public.assessment_results IS 'Detailed analysis results for assessments';