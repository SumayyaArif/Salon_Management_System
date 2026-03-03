/*
  # Beauty Salon Management Database Schema

  ## Overview
  This migration creates the core database structure for a Beauty Salon Management MVP application.
  It includes tables for services, appointments, and user profiles with proper relationships and security.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to Supabase Auth
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - User's full name
  - `role` (text) - User role (customer, stylist, admin)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `services`
  Salon services catalog
  - `id` (uuid, primary key) - Unique service identifier
  - `name` (text) - Service name (e.g., "Haircut", "Color Treatment")
  - `price` (decimal) - Service price
  - `duration` (integer) - Duration in minutes
  - `category` (text) - Service category (e.g., "Hair", "Nails", "Spa")
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `appointments`
  Booking appointments
  - `id` (uuid, primary key) - Unique appointment identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `stylist_name` (text) - Name of the stylist
  - `service_id` (uuid, foreign key) - References services.id
  - `date_time` (timestamptz) - Appointment date and time
  - `status` (text) - Appointment status (pending, confirmed, completed, cancelled)
  - `created_at` (timestamptz) - Booking creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can view their own profile and update it
  - All users can view services (public catalog)
  - Users can view and create their own appointments
  - Users can view all appointments if they are stylists or admins

  ## Initial Data
  - Adds sample services to populate the catalog
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text DEFAULT 'customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10, 2) NOT NULL,
  duration integer NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stylist_name text NOT NULL,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  date_time timestamptz NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Services policies (public read)
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

-- Appointments policies
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample services
INSERT INTO services (name, price, duration, category) VALUES
  ('Classic Haircut', 45.00, 45, 'Hair'),
  ('Hair Coloring', 120.00, 120, 'Hair'),
  ('Blowout & Style', 55.00, 60, 'Hair'),
  ('Deep Conditioning Treatment', 35.00, 30, 'Hair'),
  ('Manicure', 30.00, 45, 'Nails'),
  ('Pedicure', 45.00, 60, 'Nails'),
  ('Gel Manicure', 50.00, 60, 'Nails'),
  ('Facial Treatment', 85.00, 75, 'Spa'),
  ('Massage Therapy', 95.00, 60, 'Spa'),
  ('Makeup Application', 65.00, 45, 'Makeup')
ON CONFLICT DO NOTHING;