CREATE TYPE "public"."chat_message_status" AS ENUM('sent', 'delivered', 'read');--> statement-breakpoint
CREATE TYPE "public"."chat_room_type" AS ENUM('direct', 'group');--> statement-breakpoint
CREATE TYPE "public"."crop_status" AS ENUM('planning', 'planted', 'growing', 'harvesting', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('active', 'pending', 'sold', 'expired', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('unread', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('weather_alert', 'task_reminder', 'market_price_alert', 'system_notification', 'message', 'crop_update');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('seeds', 'fertilizers', 'pesticides', 'equipment', 'tools', 'irrigation', 'livestock', 'feed', 'produce', 'grains', 'fruits', 'vegetables', 'dairy', 'meat', 'services', 'other');--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('new', 'like_new', 'good', 'fair', 'poor');--> statement-breakpoint
CREATE TABLE "ai_assistant_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"context_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"session_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"listing_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"price_unit" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"shipping" numeric(10, 2) DEFAULT '0',
	"tax" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"payment_provider" text,
	"payment_intent_id" text,
	"payment_status" text,
	"payment_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text NOT NULL,
	"status" "chat_message_status" DEFAULT 'sent' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"media" jsonb,
	"reply_to_id" integer,
	"is_edited" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_room_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp DEFAULT now() NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"nickname" text,
	"is_muted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"type" "chat_room_type" DEFAULT 'direct' NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"farm_type" text NOT NULL,
	"message" text NOT NULL,
	"newsletter" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer NOT NULL,
	"activity_type" text NOT NULL,
	"activity_date" date NOT NULL,
	"description" text NOT NULL,
	"cost" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_trace_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"description" text NOT NULL,
	"event_date" timestamp DEFAULT now() NOT NULL,
	"performed_by" integer NOT NULL,
	"input_materials" text,
	"output_quantity" numeric(10, 2),
	"output_unit" text,
	"blockchain_tx_id" text,
	"blockchain_tx_hash" text,
	"attachments" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_yield_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer NOT NULL,
	"predicted_yield" numeric(10, 2),
	"yield_unit" text DEFAULT 'kg',
	"confidence_level" numeric(5, 2),
	"factors_considered" jsonb,
	"prediction_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crops" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"variety" text,
	"status" text DEFAULT 'planning' NOT NULL,
	"field_id" integer,
	"field_size" text,
	"size_unit" text DEFAULT 'hectares',
	"planting_date" date,
	"expected_harvest_date" date,
	"actual_harvest_date" date,
	"expected_yield" numeric(10, 2),
	"actual_yield" numeric(10, 2),
	"yield_unit" text DEFAULT 'kg',
	"notes" text,
	"batch_id" text,
	"seed_source" text,
	"seed_variety" text,
	"organic_certified" boolean DEFAULT false,
	"certification_id" text,
	"blockchain_tx_id" text,
	"traceability_qr_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"delivery_method" text NOT NULL,
	"delivery_address" text,
	"delivery_instructions" text,
	"tracking_number" text,
	"carrier" text,
	"estimated_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"delivery_cost" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_id" integer NOT NULL,
	"status" text NOT NULL,
	"location" text,
	"notes" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "device_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" text NOT NULL,
	"device_name" text,
	"device_type" text,
	"browser" text,
	"os" text,
	"ip_address" text,
	"user_agent" text,
	"location" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"geo_path" text,
	"country" text,
	"city" text,
	"state" text,
	"is_current" boolean DEFAULT false,
	"is_trusted" boolean DEFAULT false,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "device_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "farmer_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"farm_name" text,
	"farm_location" text,
	"farm_size" text,
	"farm_type" text,
	"bio" text,
	"contact_phone" text,
	"main_crops" text[],
	"established_year" integer,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmer_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" date NOT NULL,
	"completed" boolean DEFAULT false,
	"priority" text DEFAULT 'medium',
	"related_crop_id" integer,
	"related_field_id" integer,
	"notify_before" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"location_id" integer,
	"size" numeric(10, 2),
	"size_unit" text DEFAULT 'hectares',
	"soil_type" text,
	"notes" text,
	"boundary" jsonb,
	"calculated_area" numeric(12, 2),
	"center_lat" numeric(10, 7),
	"center_lng" numeric(10, 7),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"reserved_quantity" numeric(10, 2) DEFAULT '0',
	"available_quantity" numeric(10, 2) NOT NULL,
	"low_stock_threshold" numeric(10, 2) DEFAULT '5',
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"country" text NOT NULL,
	"region" text NOT NULL,
	"city" text NOT NULL,
	"neighborhood" text,
	"postal_code" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"formatted_address" text,
	"place_id" text,
	"h3_index_8" text,
	"h3_index_9" text,
	"h3_index_10" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"email" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"success" boolean NOT NULL,
	"failure_reason" text,
	"provider" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"listing_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"seller_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"price" numeric(10, 2) NOT NULL,
	"price_currency" text DEFAULT 'ZMW' NOT NULL,
	"price_unit" text,
	"quantity" numeric(10, 2),
	"quantity_unit" text,
	"condition" text,
	"location_id" integer,
	"contact_phone" text,
	"delivery_available" boolean DEFAULT false,
	"is_negotiable" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"expires_at" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"images" text[],
	"views" integer DEFAULT 0 NOT NULL,
	"favorite_count" integer DEFAULT 0 NOT NULL,
	"tags" text[],
	"source_crop_id" integer,
	"traceability_qr_code" text,
	"certifications" text[],
	"blockchain_verified" boolean DEFAULT false,
	"traceability_batch_id" text,
	"blockchain_id" text,
	"blockchain_tx_hash" text,
	"blockchain_verified_at" timestamp,
	"greenupp_verified" boolean DEFAULT false,
	"greenupp_verified_at" timestamp,
	"greenupp_verification_level" text DEFAULT 'basic',
	"farm_name" text,
	"farm_location" text,
	"farm_size" text,
	"farm_type" text,
	"farm_established_year" integer,
	"farm_certifications" text[],
	"farm_compliance_status" text DEFAULT 'pending',
	"farm_audit_date" timestamp,
	"quality_score" numeric(3, 2),
	"quality_tested" boolean DEFAULT false,
	"quality_test_date" timestamp,
	"quality_test_results" jsonb,
	"organic_certified" boolean DEFAULT false,
	"organic_certification_id" text,
	"fair_trade_certified" boolean DEFAULT false,
	"fair_trade_certification_id" text,
	"sustainability_score" numeric(3, 2),
	"carbon_footprint" numeric(10, 2),
	"water_usage" numeric(10, 2),
	"pesticide_free" boolean DEFAULT false,
	"gmo_free" boolean DEFAULT false,
	"local_sourced" boolean DEFAULT false,
	"harvest_date" date,
	"expiry_date" date,
	"storage_conditions" text,
	"transport_method" text,
	"packaging_type" text,
	"packaging_material" text,
	"packaging_recyclable" boolean DEFAULT false,
	"seller_rating" numeric(3, 2),
	"seller_review_count" integer DEFAULT 0,
	"seller_verified" boolean DEFAULT false,
	"seller_verified_at" timestamp,
	"trust_score" numeric(3, 2),
	"transparency_level" text DEFAULT 'basic',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer,
	"seller_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email_enabled" boolean DEFAULT true,
	"push_enabled" boolean DEFAULT true,
	"weather_alerts" boolean DEFAULT true,
	"task_reminders" boolean DEFAULT true,
	"market_price_alerts" boolean DEFAULT false,
	"system_notifications" boolean DEFAULT true,
	"message_notifications" boolean DEFAULT true,
	"social_likes" boolean DEFAULT true,
	"social_comments" boolean DEFAULT true,
	"social_follows" boolean DEFAULT true,
	"social_mentions" boolean DEFAULT true,
	"social_saves" boolean DEFAULT true,
	"email_frequency" text DEFAULT 'instant',
	"email_digest_day" integer,
	"email_digest_time" integer,
	"sms_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"status" text DEFAULT 'unread' NOT NULL,
	"action_url" text,
	"expires_at" timestamp,
	"sent_via_email" boolean DEFAULT false,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"provider_email" text,
	"provider_name" text,
	"provider_picture" text,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"listing_id" integer NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'ZMW' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status" text NOT NULL,
	"notes" text,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"order_number" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'ZMW' NOT NULL,
	"shipping_address" text,
	"billing_address" text,
	"payment_method" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_intent_id" text,
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"estimated_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "plant_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"image_data" text NOT NULL,
	"plant_type" text,
	"field_id" integer,
	"crop_id" integer,
	"analysis_date" timestamp DEFAULT now() NOT NULL,
	"disease_detected" text,
	"disease_probability" numeric(5, 2),
	"disease_description" text,
	"health_status" text NOT NULL,
	"health_score" integer NOT NULL,
	"nutrient_deficiencies" text,
	"nutrient_excess" text,
	"recommendations" text,
	"additional_observations" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"description" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"analysis_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"disease_type" text NOT NULL,
	"severity" text NOT NULL,
	"estimated_duration" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active_ingredient" text,
	"product_type" text NOT NULL,
	"target_diseases" text[],
	"target_crops" text[],
	"application_rate" text,
	"safety_class" text,
	"re_entry_interval" integer,
	"pre_harvest_interval" integer,
	"organic" boolean DEFAULT false,
	"description" text,
	"manufacturer" text,
	"price" numeric(10, 2),
	"price_unit" text,
	"availability" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"treatment_step_id" integer NOT NULL,
	"application_date" timestamp DEFAULT now() NOT NULL,
	"applied_dosage" text,
	"weather_conditions" text,
	"observations" text,
	"effectiveness" integer,
	"photos" text[],
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"treatment_plan_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"treatment_type" text NOT NULL,
	"product_name" text,
	"active_ingredient" text,
	"dosage" text,
	"application_method" text,
	"frequency" text,
	"duration" integer,
	"safety_notes" text,
	"cost" numeric(10, 2),
	"cost_unit" text,
	"is_completed" boolean DEFAULT false,
	"completed_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"secret" text,
	"backup_codes" text[],
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'farmer' NOT NULL,
	"first_name" text,
	"last_name" text,
	"profile_image" text,
	"phone" text,
	"fcm_token" text,
	"fcm_token_updated_at" timestamp,
	"push_notifications_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "waitlist_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"organization" text,
	"user_type" text NOT NULL,
	"location" text NOT NULL,
	"farm_size" text,
	"primary_crops" text,
	"experience" text NOT NULL,
	"interests" text[] NOT NULL,
	"additional_info" text,
	"agree_to_terms" boolean DEFAULT false NOT NULL,
	"subscribe_updates" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"registration_date" timestamp DEFAULT now() NOT NULL,
	"invited_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_registrations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weather_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"locations" text[],
	"alerts_enabled" boolean DEFAULT true,
	"temperature_unit" text DEFAULT 'celsius',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_assistant_messages" ADD CONSTRAINT "ai_assistant_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_activities" ADD CONSTRAINT "crop_activities_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trace_events" ADD CONSTRAINT "crop_trace_events_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trace_events" ADD CONSTRAINT "crop_trace_events_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_yield_predictions" ADD CONSTRAINT "crop_yield_predictions_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_status_history" ADD CONSTRAINT "delivery_status_history_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_profiles" ADD CONSTRAINT "farmer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_tasks" ADD CONSTRAINT "farmer_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_tasks" ADD CONSTRAINT "farmer_tasks_related_crop_id_crops_id_fk" FOREIGN KEY ("related_crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_tasks" ADD CONSTRAINT "farmer_tasks_related_field_id_fields_id_fk" FOREIGN KEY ("related_field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_favorites" ADD CONSTRAINT "marketplace_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_favorites" ADD CONSTRAINT "marketplace_favorites_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_source_crop_id_crops_id_fk" FOREIGN KEY ("source_crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_messages" ADD CONSTRAINT "marketplace_messages_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_messages" ADD CONSTRAINT "marketplace_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_messages" ADD CONSTRAINT "marketplace_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_providers" ADD CONSTRAINT "oauth_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_analyses" ADD CONSTRAINT "plant_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_analyses" ADD CONSTRAINT "plant_analyses_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_analyses" ADD CONSTRAINT "plant_analyses_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_analysis_id_plant_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."plant_analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_progress" ADD CONSTRAINT "treatment_progress_treatment_step_id_treatment_steps_id_fk" FOREIGN KEY ("treatment_step_id") REFERENCES "public"."treatment_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_steps" ADD CONSTRAINT "treatment_steps_treatment_plan_id_treatment_plans_id_fk" FOREIGN KEY ("treatment_plan_id") REFERENCES "public"."treatment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_preferences" ADD CONSTRAINT "weather_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;