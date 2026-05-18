-- Generated Pitches Storage
-- Migration: 20260123133945_generated_pitches.sql
-- Purpose: Enable saving and accessing AI-generated pitch content

-- ============================================================================
-- TABLES
-- ============================================================================

-- Generated Pitches (AI-generated pitch content storage)
CREATE TABLE public.generated_pitches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
    pitch_content TEXT NOT NULL,
    title TEXT NOT NULL,
    domain public.domain_type NOT NULL,
    audience public.audience_type NOT NULL,
    language public.language_code NOT NULL,
    main_idea TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_generated_pitches_user_id ON public.generated_pitches(user_id);
CREATE INDEX idx_generated_pitches_assessment_id ON public.generated_pitches(assessment_id);
CREATE INDEX idx_generated_pitches_created_at ON public.generated_pitches(created_at DESC);
CREATE INDEX idx_generated_pitches_is_favorite ON public.generated_pitches(user_id, is_favorite) WHERE is_favorite = true;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.generated_pitches ENABLE ROW LEVEL SECURITY;

-- Generated Pitches Policies
CREATE POLICY "users_manage_own_generated_pitches"
ON public.generated_pitches
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_generated_pitches_updated_at
    BEFORE UPDATE ON public.generated_pitches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- MOCK DATA
-- ============================================================================

DO $$
DECLARE
    existing_user_id UUID;
    existing_assessment_id UUID;
    pitch1_uuid UUID := gen_random_uuid();
    pitch2_uuid UUID := gen_random_uuid();
BEGIN
    -- Get existing user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Get existing assessment
    SELECT id INTO existing_assessment_id FROM public.assessments LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample generated pitches
        INSERT INTO public.generated_pitches (
            id, user_id, assessment_id, pitch_content, title, domain, audience, language, main_idea, is_favorite
        ) VALUES
            (
                pitch1_uuid,
                existing_user_id,
                existing_assessment_id,
                'Our innovative biosensor technology revolutionizes early disease detection by combining advanced nanotechnology with machine learning algorithms. This breakthrough enables real-time monitoring of biomarkers with unprecedented accuracy, reducing diagnosis time from weeks to minutes. Our solution addresses a critical gap in healthcare diagnostics, offering a cost-effective alternative to traditional laboratory testing while maintaining clinical-grade precision.',
                'Revolutionary Biosensor Technology',
                'biotech'::public.domain_type,
                'venture-capital'::public.audience_type,
                'en'::public.language_code,
                'Develop a biosensor for early disease detection using nanotechnology',
                true
            ),
            (
                pitch2_uuid,
                existing_user_id,
                NULL,
                'We are developing next-generation quantum computing solutions that solve complex optimization problems exponentially faster than classical computers. Our proprietary quantum algorithms target financial modeling, drug discovery, and cryptography applications. With strategic partnerships in place and a proven prototype, we are positioned to capture significant market share in the emerging quantum computing industry.',
                'Quantum Computing Solutions',
                'deeptech'::public.domain_type,
                'funding-agency'::public.audience_type,
                'en'::public.language_code,
                'Build quantum computing platform for complex problem solving',
                false
            );
        
        RAISE NOTICE 'Generated pitches mock data created successfully';
    ELSE
        RAISE NOTICE 'No existing users found. Run auth migration first.';
    END IF;
END $$;