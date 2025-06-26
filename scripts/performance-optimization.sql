-- Performance Optimization Script for Greenupp Platform
-- Run this script to add critical database indexes for better performance

-- User and Authentication Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_expires_at ON device_sessions(expires_at);

-- Farmer Profile Indexes
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_location_id ON farmer_profiles(location_id);

-- Field and Crop Indexes
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_location_id ON fields(location_id);
CREATE INDEX IF NOT EXISTS idx_fields_created_at ON fields(created_at);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON crops(field_id);
CREATE INDEX IF NOT EXISTS idx_crops_planting_date ON crops(planting_date);
CREATE INDEX IF NOT EXISTS idx_crops_harvest_date ON crops(harvest_date);

-- Task Management Indexes
CREATE INDEX IF NOT EXISTS idx_farmer_tasks_user_id ON farmer_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_tasks_crop_id ON farmer_tasks(crop_id);
CREATE INDEX IF NOT EXISTS idx_farmer_tasks_field_id ON farmer_tasks(field_id);
CREATE INDEX IF NOT EXISTS idx_farmer_tasks_due_date ON farmer_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_farmer_tasks_priority ON farmer_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_farmer_tasks_status ON farmer_tasks(status);
CREATE INDEX IF NOT EXISTS idx_farmer_tasks_completed_at ON farmer_tasks(completed_at);

-- Plant Analysis Indexes
CREATE INDEX IF NOT EXISTS idx_plant_analyses_user_id ON plant_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_analyses_field_id ON plant_analyses(field_id);
CREATE INDEX IF NOT EXISTS idx_plant_analyses_crop_id ON plant_analyses(crop_id);
CREATE INDEX IF NOT EXISTS idx_plant_analyses_analysis_date ON plant_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_plant_analyses_disease_detected ON plant_analyses(disease_detected);

-- Marketplace Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_condition ON marketplace_listings(condition);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location_id ON marketplace_listings(location_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON marketplace_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON marketplace_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_views ON marketplace_listings(views);

-- Location and Geospatial Indexes
CREATE INDEX IF NOT EXISTS idx_locations_latitude_longitude ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_h3_index_8 ON locations(h3_index_8);
CREATE INDEX IF NOT EXISTS idx_locations_h3_index_9 ON locations(h3_index_9);
CREATE INDEX IF NOT EXISTS idx_locations_h3_index_10 ON locations(h3_index_10);
CREATE INDEX IF NOT EXISTS idx_locations_country_city ON locations(country, city);

-- Weather and Climate Indexes
CREATE INDEX IF NOT EXISTS idx_weather_preferences_user_id ON weather_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_preferences_location_id ON weather_preferences(location_id);
CREATE INDEX IF NOT EXISTS idx_crop_yield_predictions_crop_id ON crop_yield_predictions(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_yield_predictions_prediction_date ON crop_yield_predictions(prediction_date);

-- Treatment Plan Indexes
CREATE INDEX IF NOT EXISTS idx_treatment_plans_user_id ON treatment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_analysis_id ON treatment_plans(analysis_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON treatment_plans(status);
CREATE INDEX IF NOT EXISTS idx_treatment_steps_plan_id ON treatment_steps(plan_id);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_step_id ON treatment_progress(step_id);

-- Order and Inventory Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_listing_id ON inventory(listing_id);

-- Notification Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Chat and Messaging Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_sender_id ON marketplace_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_receiver_id ON marketplace_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_listing_id ON marketplace_messages(listing_id);

-- Composite Indexes for Complex Queries
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category_status_price ON marketplace_listings(category, status, price);
CREATE INDEX IF NOT EXISTS idx_farmer_tasks_user_priority_due_date ON farmer_tasks(user_id, priority, due_date);
CREATE INDEX IF NOT EXISTS idx_plant_analyses_user_date_disease ON plant_analyses(user_id, analysis_date, disease_detected);

-- Full-text Search Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_title_description_fts ON marketplace_listings USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_plant_analyses_notes_fts ON plant_analyses USING gin(to_tsvector('english', notes));

-- Update table statistics for query planner
ANALYZE users;
ANALYZE sessions;
ANALYZE device_sessions;
ANALYZE farmer_profiles;
ANALYZE fields;
ANALYZE crops;
ANALYZE farmer_tasks;
ANALYZE plant_analyses;
ANALYZE marketplace_listings;
ANALYZE locations;
ANALYZE weather_preferences;
ANALYZE treatment_plans;
ANALYZE orders;
ANALYZE notifications;
ANALYZE chat_messages;

-- Performance monitoring queries
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('users', 'marketplace_listings', 'farmer_tasks', 'plant_analyses')
ORDER BY tablename, attname; 