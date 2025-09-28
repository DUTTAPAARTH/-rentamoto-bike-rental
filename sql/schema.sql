/**
 * RENTAMOTO Database Schema
 * 
 * This file contains the SQL commands to set up the Supabase database
 * for the RENTAMOTO bike rental management system.
 * 
 * Tables:
 * 1. user_profiles - extends Supabase auth.users with additional profile info
 * 2. bikes - bike inventory with location data
 * 3. bookings - rental transactions
 * 
 * Execute this in your Supabase SQL Editor or run via migration script.
 */

-- NOTE: JWT secret and RLS are handled automatically by Supabase
-- No manual configuration needed for authentication

-- ========================================
-- USER PROFILES TABLE
-- ========================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for role-based queries
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- BIKES TABLE
-- ========================================
-- Stores bike inventory with location and availability
CREATE TABLE IF NOT EXISTS public.bikes (
    id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    price_per_hour NUMERIC(10,2) NOT NULL CHECK (price_per_hour > 0),
    is_available BOOLEAN DEFAULT true NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT,
    image_url TEXT,
    qr_code VARCHAR(100) UNIQUE,
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_bikes_availability ON public.bikes(is_available);
CREATE INDEX idx_bikes_location ON public.bikes(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_bikes_brand ON public.bikes(brand);

-- Enable RLS on bikes
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bikes
CREATE POLICY "Anyone can view available bikes" ON public.bikes
    FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can view all bikes" ON public.bikes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify bikes" ON public.bikes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- BOOKINGS TABLE
-- ========================================
-- Stores rental transactions and history
CREATE TABLE IF NOT EXISTS public.bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bike_id INTEGER NOT NULL REFERENCES public.bikes(id) ON DELETE RESTRICT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_cost NUMERIC(10,2) CHECK (total_cost >= 0),
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    start_latitude DOUBLE PRECISION,
    start_longitude DOUBLE PRECISION,
    end_latitude DOUBLE PRECISION,
    end_longitude DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Business logic constraints
    CONSTRAINT valid_booking_time CHECK (
        end_time IS NULL OR end_time >= start_time
    ),
    CONSTRAINT valid_total_cost CHECK (
        (end_time IS NULL AND total_cost IS NULL) OR 
        (end_time IS NOT NULL AND total_cost IS NOT NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_bike_id ON public.bookings(bike_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all bookings" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bikes_updated_at BEFORE UPDATE ON public.bikes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate booking cost
CREATE OR REPLACE FUNCTION calculate_booking_cost(
    p_booking_id INTEGER
) RETURNS NUMERIC AS $$
DECLARE
    v_start_time TIMESTAMP WITH TIME ZONE;
    v_end_time TIMESTAMP WITH TIME ZONE;
    v_price_per_hour NUMERIC;
    v_hours NUMERIC;
    v_cost NUMERIC;
BEGIN
    SELECT b.start_time, b.end_time, bk.price_per_hour
    INTO v_start_time, v_end_time, v_price_per_hour
    FROM public.bookings b
    JOIN public.bikes bk ON b.bike_id = bk.id
    WHERE b.booking_id = p_booking_id;
    
    IF v_end_time IS NULL THEN
        RETURN NULL;
    END IF;
    
    v_hours := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) / 3600;
    v_cost := v_hours * v_price_per_hour;
    
    -- Minimum charge of 1 hour
    IF v_cost < v_price_per_hour THEN
        v_cost := v_price_per_hour;
    END IF;
    
    RETURN ROUND(v_cost, 2);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- SAMPLE DATA (Optional - for development)
-- ========================================

-- Insert sample admin user (run after creating first user via Supabase Auth)
-- INSERT INTO public.user_profiles (id, name, role) 
-- VALUES ('your-admin-user-id', 'Admin User', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Insert sample bikes
INSERT INTO public.bikes (model, brand, price_per_hour, latitude, longitude, description) VALUES
('City Cruiser', 'RENTAMOTO', 5.00, 40.7128, -74.0060, 'Comfortable city bike perfect for urban rides'),
('Mountain Explorer', 'RENTAMOTO', 8.00, 40.7614, -73.9776, 'Rugged mountain bike for adventurous riders'),
('Speed Demon', 'RENTAMOTO', 6.50, 40.7505, -73.9934, 'Lightweight road bike for speed enthusiasts'),
('Electric Glide', 'RENTAMOTO', 12.00, 40.7282, -73.7949, 'Electric bike with 50-mile range'),
('Family Rider', 'RENTAMOTO', 4.50, 40.6892, -74.0445, 'Family-friendly bike with safety features')
ON CONFLICT DO NOTHING;

-- ========================================
-- PERMISSIONS
-- ========================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.bikes TO authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to anon users (for public bike viewing)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.bikes TO anon;

COMMENT ON TABLE public.user_profiles IS 'Extended user profiles with role-based access';
COMMENT ON TABLE public.bikes IS 'Bike inventory with location and availability tracking';
COMMENT ON TABLE public.bookings IS 'Rental transactions and booking history';

-- ========================================
-- VIEWS (Optional - for analytics)
-- ========================================

-- View for active rentals
CREATE OR REPLACE VIEW public.active_rentals AS
SELECT 
    b.booking_id,
    b.user_id,
    up.name as user_name,
    b.bike_id,
    bk.model as bike_model,
    bk.brand as bike_brand,
    b.start_time,
    EXTRACT(EPOCH FROM (NOW() - b.start_time)) / 3600 as hours_elapsed,
    bk.price_per_hour,
    ROUND(EXTRACT(EPOCH FROM (NOW() - b.start_time)) / 3600 * bk.price_per_hour, 2) as current_cost
FROM public.bookings b
JOIN public.user_profiles up ON b.user_id = up.id
JOIN public.bikes bk ON b.bike_id = bk.id
WHERE b.status = 'active' AND b.end_time IS NULL;

-- View for revenue analytics
CREATE OR REPLACE VIEW public.revenue_summary AS
SELECT 
    DATE(b.created_at) as date,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN b.total_cost ELSE 0 END) as daily_revenue,
    AVG(CASE WHEN b.status = 'completed' THEN b.total_cost ELSE NULL END) as avg_booking_value
FROM public.bookings b
GROUP BY DATE(b.created_at)
ORDER BY date DESC;