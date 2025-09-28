# Database Schema for Bike Usage Analytics
# This creates a custom function for better bike usage analytics

CREATE OR REPLACE FUNCTION get_bike_usage_stats(
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    limit_count integer DEFAULT 20
)
RETURNS TABLE (
    bike_id integer,
    model text,
    brand text,
    total_bookings bigint,
    total_revenue numeric,
    total_hours numeric,
    average_trip_duration numeric,
    utilization_rate numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as bike_id,
        b.model,
        b.brand,
        COUNT(bk.booking_id) as total_bookings,
        COALESCE(SUM(bk.total_cost), 0) as total_revenue,
        COALESCE(SUM(
            EXTRACT(EPOCH FROM (bk.end_time - bk.start_time)) / 3600
        ), 0) as total_hours,
        COALESCE(AVG(
            EXTRACT(EPOCH FROM (bk.end_time - bk.start_time)) / 3600
        ), 0) as average_trip_duration,
        -- Calculate utilization rate as percentage of time in use
        COALESCE(
            (SUM(EXTRACT(EPOCH FROM (bk.end_time - bk.start_time))) / 
            EXTRACT(EPOCH FROM (end_date - start_date))) * 100, 0
        ) as utilization_rate
    FROM public.bikes b
    LEFT JOIN public.bookings bk ON b.id = bk.bike_id 
        AND bk.created_at >= start_date 
        AND bk.created_at <= end_date
        AND bk.status = 'completed'
        AND bk.end_time IS NOT NULL
    GROUP BY b.id, b.model, b.brand
    ORDER BY total_revenue DESC, total_bookings DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION get_bike_usage_stats TO authenticated;