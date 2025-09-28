# 🔧 Manual Database Setup for RENTAMOTO

The automated migration didn't work properly, so let's set up the database manually through the Supabase dashboard.

## 📋 Step-by-Step Manual Setup

### **Step 1: Access Supabase SQL Editor**

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project (should be the one with URL ending in `yorswtoltpvnlonoawpn.supabase.co`)
3. In the left sidebar, click **"SQL Editor"**

### **Step 2: Execute Database Schema**

1. **Copy the SQL below** (or copy from `sql/schema.sql` file)
2. **Paste it in the SQL Editor**
3. **Click "Run"** button

```sql
-- RENTAMOTO Database Schema
-- Execute this in your Supabase SQL Editor

-- NOTE: JWT secret configuration is handled automatically by Supabase
-- No manual configuration needed for authentication

-- ========================================
-- USER PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- BIKES TABLE
-- ========================================
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
CREATE INDEX IF NOT EXISTS idx_bikes_availability ON public.bikes(is_available);
CREATE INDEX IF NOT EXISTS idx_bikes_location ON public.bikes(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bikes_brand ON public.bikes(brand);

-- Enable RLS on bikes
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- BOOKINGS TABLE
-- ========================================
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
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_bike_id ON public.bookings(bike_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

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
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bikes_updated_at ON public.bikes;
CREATE TRIGGER update_bikes_updated_at BEFORE UPDATE ON public.bikes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample bikes
INSERT INTO public.bikes (model, brand, price_per_hour, latitude, longitude, description) VALUES
('City Cruiser', 'RENTAMOTO', 5.00, 40.7128, -74.0060, 'Comfortable city bike perfect for urban rides'),
('Mountain Explorer', 'RENTAMOTO', 8.00, 40.7614, -73.9776, 'Rugged mountain bike for adventurous riders'),
('Speed Demon', 'RENTAMOTO', 6.50, 40.7505, -73.9934, 'Lightweight road bike for speed enthusiasts'),
('Electric Glide', 'RENTAMOTO', 12.00, 40.7282, -73.7949, 'Electric bike with 50-mile range'),
('Family Rider', 'RENTAMOTO', 4.50, 40.6892, -74.0445, 'Family-friendly bike with safety features')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.bikes TO authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to anon users (for public bike viewing)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.bikes TO anon;
```

### **Step 3: Set Up Row Level Security Policies**

After running the main schema, run this second SQL script:

```sql
-- Row Level Security Policies for RENTAMOTO

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for bikes
DROP POLICY IF EXISTS "Anyone can view available bikes" ON public.bikes;
CREATE POLICY "Anyone can view available bikes" ON public.bikes
    FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "Authenticated users can view all bikes" ON public.bikes;
CREATE POLICY "Authenticated users can view all bikes" ON public.bikes
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can modify bikes" ON public.bikes;
CREATE POLICY "Only admins can modify bikes" ON public.bikes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
CREATE POLICY "Users can create their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
CREATE POLICY "Admins can update all bookings" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### **Step 4: Verify Tables Were Created**

1. Go to **"Table Editor"** in the left sidebar
2. You should see 3 tables: `user_profiles`, `bikes`, `bookings`
3. The `bikes` table should have 5 sample bikes

### **Step 5: Test the Server**

Now try starting your development server:

```bash
npm run dev
```

If it starts successfully, test the API:

```bash
curl http://localhost:3000/health
```

---

## ✅ What This Sets Up

- ✅ **user_profiles** table with admin/customer roles
- ✅ **bikes** table with sample bikes
- ✅ **bookings** table for rental transactions
- ✅ **Row Level Security** policies
- ✅ **Database triggers** for automatic profile creation
- ✅ **Sample data** (5 bikes ready for rental)

Once this is done, your RENTAMOTO backend should be fully functional! 🎉
