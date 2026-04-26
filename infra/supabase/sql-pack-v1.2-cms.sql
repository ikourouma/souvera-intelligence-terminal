-- ==========================================
-- SOUVERA SQL PACK v1.2: CMS ARCHITECTURE
-- ==========================================
-- This pack establishes the admin-managed tables for the frontend.

-- 1. Hero Slides
CREATE TABLE IF NOT EXISTS public.souvera_hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL DEFAULT 'single_image', -- 'video', 'single_image', 'dual_image'
    media_1 TEXT,
    media_2 TEXT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    primary_cta_text VARCHAR(100) NOT NULL,
    primary_cta_link TEXT NOT NULL,
    secondary_cta_type VARCHAR(50), -- 'button', 'event_details'
    secondary_cta_text VARCHAR(100),
    secondary_cta_link TEXT,
    event_date VARCHAR(100),
    event_location VARCHAR(150),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events & Summits
CREATE TABLE IF NOT EXISTS public.souvera_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location VARCHAR(200) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- e.g., 'summit', 'briefing', 'webinar'
    registration_link TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FAQs
CREATE TABLE IF NOT EXISTS public.souvera_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL, -- e.g., 'Data Capabilities', 'Enterprise Access'
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. News & Insights
CREATE TABLE IF NOT EXISTS public.souvera_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headline TEXT NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Market Outlook', 'Policy', 'Data Terminal'
    content TEXT NOT NULL,
    author VARCHAR(100),
    cover_image TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS logic
ALTER TABLE public.souvera_hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_news ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all CMS tables
CREATE POLICY "Public read souvera_hero_slides" ON public.souvera_hero_slides FOR SELECT USING (true);
CREATE POLICY "Public read souvera_events" ON public.souvera_events FOR SELECT USING (true);
CREATE POLICY "Public read souvera_faqs" ON public.souvera_faqs FOR SELECT USING (true);
CREATE POLICY "Public read souvera_news" ON public.souvera_news FOR SELECT USING (is_published = true);

-- Add initial seed data for Hero Slides (Alignment with new Bloomberg/Souvera messaging)
INSERT INTO public.souvera_hero_slides (type, media_1, title, subtitle, primary_cta_text, primary_cta_link, sort_order)
VALUES (
    'single_image', 
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop',
    'Erasing Macro Lag Across the Transatlantic Corridor.',
    'A live data stream eliminating the 6-month reporting delay in African and Caribbean indicators. Institutional intelligence built for instant traction.',
    'Access Terminal',
    '/terminal',
    1
);
