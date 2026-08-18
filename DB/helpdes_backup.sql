/*
 Navicat Premium Data Transfer

 Source Server         : Postgre 100.20.30.254
 Source Server Type    : PostgreSQL
 Source Server Version : 160014 (160014)
 Source Host           : 100.20.30.254:5432
 Source Catalog        : helpdesk
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160014 (160014)
 File Encoding         : 65001

 Date: 13/08/2026 11:23:24
*/


-- ----------------------------
-- Sequence structure for failed_jobs_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "failed_jobs_id_seq";
CREATE SEQUENCE "failed_jobs_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for jobs_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "jobs_id_seq";
CREATE SEQUENCE "jobs_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for migrations_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "migrations_id_seq";
CREATE SEQUENCE "migrations_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for projects_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "projects_id_seq";
CREATE SEQUENCE "projects_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ticket_comments_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "ticket_comments_id_seq";
CREATE SEQUENCE "ticket_comments_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tickets_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "tickets_id_seq";
CREATE SEQUENCE "tickets_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "users_id_seq";
CREATE SEQUENCE "users_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for cache
-- ----------------------------
DROP TABLE IF EXISTS "cache";
CREATE TABLE "cache" (
  "key" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "value" text COLLATE "pg_catalog"."default" NOT NULL,
  "expiration" int4 NOT NULL
)
;

-- ----------------------------
-- Records of cache
-- ----------------------------
BEGIN;
INSERT INTO "cache" ("key", "value", "expiration") VALUES ('tiket-oetomo-hospital-cache-casemix|100.20.30.1:timer', 'i:1786510321;', 1786510321), ('tiket-oetomo-hospital-cache-casemix|100.20.30.1', 'i:1;', 1786510321), ('tiket-oetomo-hospital-cache-ilman.nurfalah@oetomohospital.id|100.20.30.1:timer', 'i:1786434437;', 1786434437), ('tiket-oetomo-hospital-cache-ilman.nurfalah@oetomohospital.id|100.20.30.1', 'i:1;', 1786434437), ('tiket-oetomo-hospital-cache-casemix@oetomohospital.id|100.20.30.1:timer', 'i:1786510060;', 1786510060), ('tiket-oetomo-hospital-cache-casemix@oetomohospital.id|100.20.30.1', 'i:2;', 1786510060);
COMMIT;

-- ----------------------------
-- Table structure for cache_locks
-- ----------------------------
DROP TABLE IF EXISTS "cache_locks";
CREATE TABLE "cache_locks" (
  "key" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "expiration" int4 NOT NULL
)
;

-- ----------------------------
-- Records of cache_locks
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for failed_jobs
-- ----------------------------
DROP TABLE IF EXISTS "failed_jobs";
CREATE TABLE "failed_jobs" (
  "id" int8 NOT NULL DEFAULT nextval('failed_jobs_id_seq'::regclass),
  "uuid" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "connection" text COLLATE "pg_catalog"."default" NOT NULL,
  "queue" text COLLATE "pg_catalog"."default" NOT NULL,
  "payload" text COLLATE "pg_catalog"."default" NOT NULL,
  "exception" text COLLATE "pg_catalog"."default" NOT NULL,
  "failed_at" timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of failed_jobs
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for job_batches
-- ----------------------------
DROP TABLE IF EXISTS "job_batches";
CREATE TABLE "job_batches" (
  "id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "total_jobs" int4 NOT NULL,
  "pending_jobs" int4 NOT NULL,
  "failed_jobs" int4 NOT NULL,
  "failed_job_ids" text COLLATE "pg_catalog"."default" NOT NULL,
  "options" text COLLATE "pg_catalog"."default",
  "cancelled_at" int4,
  "created_at" int4 NOT NULL,
  "finished_at" int4
)
;

-- ----------------------------
-- Records of job_batches
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for jobs
-- ----------------------------
DROP TABLE IF EXISTS "jobs";
CREATE TABLE "jobs" (
  "id" int8 NOT NULL DEFAULT nextval('jobs_id_seq'::regclass),
  "queue" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "payload" text COLLATE "pg_catalog"."default" NOT NULL,
  "attempts" int2 NOT NULL,
  "reserved_at" int4,
  "available_at" int4 NOT NULL,
  "created_at" int4 NOT NULL
)
;

-- ----------------------------
-- Records of jobs
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS "migrations";
CREATE TABLE "migrations" (
  "id" int4 NOT NULL DEFAULT nextval('migrations_id_seq'::regclass),
  "migration" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "batch" int4 NOT NULL
)
;

-- ----------------------------
-- Records of migrations
-- ----------------------------
BEGIN;
INSERT INTO "migrations" ("id", "migration", "batch") VALUES (1, '0001_01_01_000000_create_users_table', 1), (2, '0001_01_01_000001_create_cache_table', 1), (3, '0001_01_01_000002_create_jobs_table', 1), (4, '2026_04_08_023330_create_projects_table', 1), (5, '2026_04_08_023341_create_tickets_table', 1), (6, '2026_04_08_050000_add_unit_id_to_users_table', 1), (7, '2026_04_08_120000_add_category_type_attachments_to_tickets_table', 1), (8, '2026_04_08_130000_add_team_to_users_table', 1), (9, '2026_04_08_130010_update_ticket_statuses_to_new_flow', 1), (10, '2026_04_08_130020_add_resolution_and_feedback_to_tickets_table', 1), (11, '2026_04_08_140000_add_employee_id_and_role_to_users_table', 1), (12, '2026_04_08_160000_add_username_to_users_table', 1), (13, '2026_04_08_200000_create_ticket_comments_table', 1), (14, '2026_04_09_000000_create_notifications_table', 1), (15, '2026_04_16_000000_add_is_active_to_users_table', 1), (16, '2026_07_01_093919_add_supervisor_id_to_users_table', 2), (18, '2026_07_21_041742_update_role_and_team_names', 3), (19, '2026_07_21_042058_add_password_changed_at_to_users_table', 4), (20, '2026_07_22_052502_add_priorities_and_types_to_projects_table', 5);
COMMIT;

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS "notifications";
CREATE TABLE "notifications" (
  "id" uuid NOT NULL,
  "type" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "notifiable_type" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "notifiable_id" int8 NOT NULL,
  "data" json NOT NULL,
  "read_at" timestamp(0),
  "created_at" timestamp(0),
  "updated_at" timestamp(0)
)
;

-- ----------------------------
-- Records of notifications
-- ----------------------------
BEGIN;
INSERT INTO "notifications" ("id", "type", "notifiable_type", "notifiable_id", "data", "read_at", "created_at", "updated_at") VALUES ('3bb526cb-4eb1-4232-9e80-d8eb7b7f5457', 'App\Notifications\TicketCreated', 'App\Models\User', 5, '{"ticket_id":18,"ticket_code":"IT0001","ticket_title":"BUat IT","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-07-23 02:21:10', '2026-07-23 02:21:10'), ('bfbd19de-e3a3-4ed1-b241-147486df0281', 'App\Notifications\TicketCreated', 'App\Models\User', 14, '{"ticket_id":18,"ticket_code":"IT0001","ticket_title":"BUat IT","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-07-23 02:21:12', '2026-07-23 02:21:12'), ('63ab4b18-fa26-4a4c-a02d-1927f615d65a', 'App\Notifications\TicketCreated', 'App\Models\User', 15, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', NULL, '2026-08-06 06:40:53', '2026-08-06 06:40:53'), ('61c0f119-4575-45ad-8ff2-3767be005ac0', 'App\Notifications\TicketCreated', 'App\Models\User', 16, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', NULL, '2026-08-06 06:40:58', '2026-08-06 06:40:58'), ('a5e75c9f-8c60-40be-a7ff-fec1dd9394ed', 'App\Notifications\TicketCreated', 'App\Models\User', 19, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', NULL, '2026-08-06 06:41:02', '2026-08-06 06:41:02'), ('3d15b094-80ee-41fd-8373-1e45098d6a93', 'App\Notifications\TicketCreated', 'App\Models\User', 20, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', NULL, '2026-08-06 06:41:04', '2026-08-06 06:41:04'), ('12d1ac68-0dc6-4ab2-8f72-3ef1531896d9', 'App\Notifications\TicketCreated', 'App\Models\User', 21, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', NULL, '2026-08-06 06:41:06', '2026-08-06 06:41:06'), ('591fb05b-9b5e-4b6f-87c7-f2cc870ab63c', 'App\Notifications\TicketCreated', 'App\Models\User', 22, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', NULL, '2026-08-06 06:41:08', '2026-08-06 06:41:08'), ('94d7575f-4d39-4608-9a8f-8615967eb345', 'App\Notifications\TicketCreated', 'App\Models\User', 23, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', NULL, '2026-08-06 06:41:10', '2026-08-06 06:41:10'), ('9f98fdaf-80db-4245-ace2-7bccab753fc6', 'App\Notifications\TicketCreated', 'App\Models\User', 24, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', NULL, '2026-08-06 06:41:12', '2026-08-06 06:41:12'), ('71733f0c-53ed-4f69-8fee-cd9ebb64dfa6', 'App\Notifications\TicketCreated', 'App\Models\User', 15, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', NULL, '2026-08-10 14:07:19', '2026-08-10 14:07:19'), ('ee7bc426-ee43-4ed9-8534-2793f3e4559c', 'App\Notifications\TicketCreated', 'App\Models\User', 16, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', NULL, '2026-08-10 14:07:27', '2026-08-10 14:07:27'), ('52234782-4b5c-4814-9b69-99ebb5fdbfa4', 'App\Notifications\TicketCreated', 'App\Models\User', 19, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', NULL, '2026-08-10 14:07:31', '2026-08-10 14:07:31'), ('1277e70c-9768-40ac-8438-47a7e0541008', 'App\Notifications\TicketCreated', 'App\Models\User', 20, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', NULL, '2026-08-10 14:07:33', '2026-08-10 14:07:33'), ('655405a1-01b7-414c-a61a-bcbf6028b6b2', 'App\Notifications\TicketCreated', 'App\Models\User', 21, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', NULL, '2026-08-10 14:07:34', '2026-08-10 14:07:34'), ('7d350f6b-87ae-4f95-b958-977caa93d9c8', 'App\Notifications\TicketCreated', 'App\Models\User', 22, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', NULL, '2026-08-10 14:07:36', '2026-08-10 14:07:36'), ('626eb8ec-3bdf-496e-9331-5f8328f239a6', 'App\Notifications\TicketCreated', 'App\Models\User', 23, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', NULL, '2026-08-10 14:07:38', '2026-08-10 14:07:38'), ('fc6fcbca-1537-41a0-a7f6-025eb2e0501b', 'App\Notifications\TicketCreated', 'App\Models\User', 24, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', NULL, '2026-08-10 14:07:40', '2026-08-10 14:07:40'), ('726fa6be-8be6-47a2-86b3-4bdf0e7fdd87', 'App\Notifications\TicketCommented', 'App\Models\User', 5, '{"type":"ticket_comment","ticket_id":18,"ticket_code":"IT0001","ticket_title":"BUat IT","comment_id":15,"actor_id":13,"actor_name":"Dani Kosasih","message":"Baik nanti kami perbaiki secepatnya","url":"https:\/\/ticketing.oetomohospital.id\/tickets\/18","created_at":"2026-08-11T02:05:59.000000Z"}', NULL, '2026-08-11 02:05:59', '2026-08-11 02:05:59'), ('0dc0a302-3ade-41b2-baea-ed7136d3d398', 'App\Notifications\TicketCreated', 'App\Models\User', 5, '{"ticket_id":21,"ticket_code":"IT0002","ticket_title":"Copy Data dari Komputer Ke Laptop","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 02:09:56', '2026-08-11 02:09:56'), ('fbf802f6-637b-4ed6-b0ac-1027c5f7702c', 'App\Notifications\TicketCreated', 'App\Models\User', 15, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:37', '2026-08-11 04:09:37'), ('d21473b3-03e3-41e8-a8bd-111ee0dd4558', 'App\Notifications\TicketCreated', 'App\Models\User', 16, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:43', '2026-08-11 04:09:43'), ('027bd1bd-be4a-4270-a054-e6ddb826a86b', 'App\Notifications\TicketCreated', 'App\Models\User', 5, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:45', '2026-08-11 04:09:45'), ('b00b7aa3-e936-457b-a904-60687198a544', 'App\Notifications\TicketCreated', 'App\Models\User', 6, '{"ticket_id":21,"ticket_code":"IT0002","ticket_title":"Copy Data dari Komputer Ke Laptop","actor_name":"Trias Nur Rahayu, S.M"}', '2026-08-11 04:43:21', '2026-08-11 02:09:55', '2026-08-11 04:43:21'), ('cd070394-3a9d-414c-89ba-f73a5f70966c', 'App\Notifications\TicketCreated', 'App\Models\User', 6, '{"ticket_id":18,"ticket_code":"IT0001","ticket_title":"BUat IT","actor_name":"Trias Nur Rahayu, S.M"}', '2026-08-11 04:46:38', '2026-07-23 02:21:09', '2026-08-11 04:46:38'), ('ed0356c4-33ca-4699-ab20-81fa70d24a06', 'App\Notifications\TicketCreated', 'App\Models\User', 13, '{"ticket_id":18,"ticket_code":"IT0001","ticket_title":"BUat IT","actor_name":"Trias Nur Rahayu, S.M"}', '2026-08-11 07:38:09', '2026-07-23 02:21:06', '2026-08-11 07:38:09'), ('0061f9b9-e9e0-4482-ae93-612cf54eb811', 'App\Notifications\TicketCreated', 'App\Models\User', 4, '{"ticket_id":18,"ticket_code":"IT0001","ticket_title":"BUat IT","actor_name":"Trias Nur Rahayu, S.M"}', '2026-08-11 07:40:20', '2026-07-23 02:21:13', '2026-08-11 07:40:20'), ('970295dd-e736-45d0-946c-1a9dc43cfa1b', 'App\Notifications\TicketCreated', 'App\Models\User', 4, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', '2026-08-11 07:40:20', '2026-08-06 06:41:14', '2026-08-11 07:40:20'), ('50230a09-a82c-4e2b-b026-754e8410d66e', 'App\Notifications\TicketCreated', 'App\Models\User', 4, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', '2026-08-11 07:40:20', '2026-08-10 14:07:42', '2026-08-11 07:40:20'), ('cbab3971-7de4-490d-9861-e7b82570925d', 'App\Notifications\TicketCreated', 'App\Models\User', 4, '{"ticket_id":21,"ticket_code":"IT0002","ticket_title":"Copy Data dari Komputer Ke Laptop","actor_name":"Trias Nur Rahayu, S.M"}', '2026-08-11 07:40:20', '2026-08-11 02:09:59', '2026-08-11 07:40:20'), ('aea2ad02-ec90-4fca-b154-ce103997f772', 'App\Notifications\TicketCreated', 'App\Models\User', 19, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:46', '2026-08-11 04:09:46'), ('639c2a98-3b92-4d7f-8991-ab8b44361b49', 'App\Notifications\TicketCreated', 'App\Models\User', 20, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:48', '2026-08-11 04:09:48'), ('06aa3183-ccdf-4f7f-81a4-5780ba7c6271', 'App\Notifications\TicketCreated', 'App\Models\User', 21, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:49', '2026-08-11 04:09:49'), ('0c9a2cdf-0345-4620-9628-76aace989574', 'App\Notifications\TicketCreated', 'App\Models\User', 22, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:51', '2026-08-11 04:09:51'), ('ece9108d-7f6f-456a-ac36-cf301ccbd8f3', 'App\Notifications\TicketCreated', 'App\Models\User', 23, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:52', '2026-08-11 04:09:52'), ('64203848-93a9-473b-ac85-82e3145ef7d3', 'App\Notifications\TicketCreated', 'App\Models\User', 24, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', NULL, '2026-08-11 04:09:53', '2026-08-11 04:09:53'), ('857f675f-d251-4d8c-8e4f-999dd982c518', 'App\Notifications\TicketCreated', 'App\Models\User', 14, '{"ticket_id":21,"ticket_code":"IT0002","ticket_title":"Copy Data dari Komputer Ke Laptop","actor_name":"Trias Nur Rahayu, S.M"}', '2026-08-11 04:43:01', '2026-08-11 02:09:58', '2026-08-11 04:43:01'), ('3c3df920-863e-43d0-be95-ae0ab5b785df', 'App\Notifications\TicketCreated', 'App\Models\User', 13, '{"ticket_id":19,"ticket_code":"IPS0001","ticket_title":"Buatkan Stop Kontak","actor_name":"Dani Kosasih"}', '2026-08-11 07:38:09', '2026-08-06 06:41:00', '2026-08-11 07:38:09'), ('51cf5b2f-448a-47e3-9e35-c9a854b6f487', 'App\Notifications\TicketCreated', 'App\Models\User', 13, '{"ticket_id":20,"ticket_code":"IPS0002","ticket_title":"Perbaikan AC","actor_name":"Dani Kosasih"}', '2026-08-11 07:38:09', '2026-08-10 14:07:29', '2026-08-11 07:38:09'), ('da48164d-f9fb-4d50-96d7-fe8e47e3e229', 'App\Notifications\TicketCreated', 'App\Models\User', 13, '{"ticket_id":21,"ticket_code":"IT0002","ticket_title":"Copy Data dari Komputer Ke Laptop","actor_name":"Trias Nur Rahayu, S.M"}', '2026-08-11 07:38:09', '2026-08-11 02:09:49', '2026-08-11 07:38:09'), ('b9d4da99-465e-4bd6-8028-edb8631034bc', 'App\Notifications\TicketCreated', 'App\Models\User', 4, '{"ticket_id":22,"ticket_code":"IPS0003","ticket_title":"AC ruangan POli  7 Panas","actor_name":"Trias Nur Rahayu, S.M"}', '2026-08-11 07:40:20', '2026-08-11 04:09:55', '2026-08-11 07:40:20');
COMMIT;

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS "password_reset_tokens";
CREATE TABLE "password_reset_tokens" (
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "token" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(0)
)
;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS "projects";
CREATE TABLE "projects" (
  "id" int8 NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "code" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamp(0),
  "updated_at" timestamp(0),
  "priorities" json,
  "types" json
)
;

-- ----------------------------
-- Records of projects
-- ----------------------------
BEGIN;
INSERT INTO "projects" ("id", "name", "code", "created_at", "updated_at", "priorities", "types") VALUES (1, 'Helpdesk Internal', 'HELPDESK', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (2, 'IGD', 'IGD', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (3, 'Rawat Inap', 'RAWAT-INAP', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (4, 'Rawat Jalan', 'RAWAT-JALAN', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (5, 'Keuangan', 'KEUANGAN', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (6, 'HRD', 'HRD', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (7, 'Farmasi', 'FARMASI', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (8, 'Laboratorium', 'LAB', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (9, 'Radiologi', 'RADIOLOGI', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (11, 'Teknologi Informasi', 'TI', '2026-07-21 09:56:32', '2026-07-21 09:56:35', NULL, NULL), (10, 'IPSRS', 'IPSRS', '2026-07-01 08:05:26', '2026-07-01 08:05:26', NULL, NULL), (12, 'Komite', 'Komite', NULL, NULL, NULL, NULL), (13, 'Keperawatan', 'KP', NULL, NULL, NULL, NULL), (14, 'Kasir', 'Kasir', NULL, NULL, NULL, NULL), (15, 'Billing', 'Billing', NULL, NULL, NULL, NULL), (16, 'Admission', 'Admission', NULL, NULL, NULL, NULL), (17, 'Purchasing', 'Purchasing', NULL, NULL, NULL, NULL), (18, 'Casemix', 'Casemix', NULL, NULL, NULL, NULL), (19, 'Kesekertariatan', 'Kesekertariatan', NULL, NULL, NULL, NULL), (20, 'Akunting', 'Akunting', NULL, NULL, NULL, NULL), (21, 'Rekam Medis', 'RM', NULL, NULL, NULL, NULL), (22, 'Farmasi', 'Farmasi', NULL, NULL, NULL, NULL), (23, 'Gizi', 'Gizi', NULL, NULL, NULL, NULL), (24, 'VK', 'VK', NULL, NULL, NULL, NULL), (25, 'Perina / Nicu', 'Perina', NULL, NULL, NULL, NULL), (26, 'ICU', 'ICU', NULL, NULL, NULL, NULL), (27, 'IBS', 'IBS', NULL, NULL, NULL, NULL), (28, 'CSSD', 'CSSD', NULL, NULL, NULL, NULL), (29, 'Marketing', 'Marketing', NULL, NULL, NULL, NULL), (30, 'Rehab Medik', 'Rehab Medik', NULL, NULL, NULL, NULL), (31, 'Internal Kontrol', 'Internal Kontrol', NULL, NULL, NULL, NULL), (32, 'Logistik Umum', 'Logistik Umum', NULL, NULL, NULL, NULL), (33, 'PIPP', 'PIPP', NULL, NULL, NULL, NULL), (34, 'Gudang Farmasi', 'Gudang Farmasi', NULL, NULL, NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS "sessions";
CREATE TABLE "sessions" (
  "id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" int8,
  "ip_address" varchar(45) COLLATE "pg_catalog"."default",
  "user_agent" text COLLATE "pg_catalog"."default",
  "payload" text COLLATE "pg_catalog"."default" NOT NULL,
  "last_activity" int4 NOT NULL
)
;

-- ----------------------------
-- Records of sessions
-- ----------------------------
BEGIN;
INSERT INTO "sessions" ("id", "user_id", "ip_address", "user_agent", "payload", "last_activity") VALUES ('OR1aRvgivsDk3mFE8oL8G2rtm1flZpXNQfemspQO', NULL, '159.223.41.172', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaTNuRHp1ZFdjR1hKMDk4STdON0dzelJJZTM3UW9HOUxoSENzb3BoMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHBzOi8vMzYuNjQuMjA2LjEwOSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786588677), ('3nRDs1ZU8tK2wWeuSwDG3su91toOnpuJ16KOGAoC', 4, '100.20.30.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 OPR/133.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiNkJvVHoyS1I5WGh2Q3pvVjRiZkcwUDJ2cmpRd2hUZ3ptNHFKRWlQQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHBzOi8vdGlja2V0aW5nLm9ldG9tb2hvc3BpdGFsLmlkIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTo0O30=', 1786593350), ('Jo2l8WdBlNnacMunmMvVTAbAUmByCZCtQkOv6RUn', NULL, '44.242.164.127', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidTlzcm8xYlVEem1nN0M3SGNNMzNmTWd3cXdpU2VnS3YzU25ldDN3RSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHBzOi8vMzYuNjQuMjA2LjExMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786593379), ('mLw1hNQO54bVdH6KpRNQJ4aqjUIRQskxMlrYaec5', NULL, '159.223.41.172', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY0R5V1dQSmpsbjVla21FNzduWk5lQjE1QzF1MThxVFFKam8yc2RyOCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHBzOi8vMzYuNjQuMjA2LjExMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786588677), ('QyLAbSEoUrJVLYdTErO8HUqB7R7DFQX8UFsUlVSv', NULL, '45.148.10.125', 'l9tcpid/v1.1.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoib1ZPRnBqVTFDUjdMaHM2U2VNaUhtdTVMRVJ0b05jeDk5YTluM09obCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHBzOi8vMzYuNjQuMjA2LjExMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786589899), ('7MlSS3MsrnDk6uBhBxlYDNUGaVY7JjbgwhTfUiqR', 4, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiWDdNUzVBblVsUXRTZDhyY1V4VXJsN1NUWUh5VFBoZEIxdnh4RDVoTiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90aWNrZXRzL2V4cG9ydCI7czo1OiJyb3V0ZSI7czoxMjoidGlja2V0cy5zaG93Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6NDt9', 1786593820), ('IjVHvFhjPbiU0Ah9fBoM0r8xI2YR40dy5f491D8D', NULL, '100.20.30.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN0xRcVRNQ1U2VzdNZW16OFkyTjVRNlhaU0tGN1p6VzY3dzFQOGVEQyI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo0NToiaHR0cHM6Ly90aWNrZXRpbmcub2V0b21vaG9zcGl0YWwuaWQvZGFzaGJvYXJkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786587311), ('RvDZxbloAFvJQPSngbNTOa7u65LwRWigIYHO7wXh', NULL, '144.202.92.17', 'Mozilla/5.0 (compatible; CyberConvoyScout/1.0; +https://scout.cyberconvoy.co)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOTE1TW91WGlNUXQwdUdMcHQwUk55Q0tLM0J4VXhESmdOWHg0Y3pmdCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHBzOi8vMzYuNjQuMjA2LjExMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786590354), ('7qGuFz6YYyaW90CuSSWEzfQD3RW4DagYlqgcMys3', NULL, '103.168.66.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaGFDWVVaVGhJU2ZHV3phUmhWN0FhRlRTeU9rNTZCQWY0aE5jS1ZXZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHBzOi8vMzYuNjQuMjA2LjExMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786594193), ('M1RewGld2k6leaiFHudQotLhz9BO673PVWAhJitY', NULL, '172.104.11.51', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVkdBVlVrdXAwVzlzdWo3RzV0ZlFwYVpBOVdnU004SEU4SVJpZGJoMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHBzOi8vMzYuNjQuMjA2LjExMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1786592571);
COMMIT;

-- ----------------------------
-- Table structure for ticket_comments
-- ----------------------------
DROP TABLE IF EXISTS "ticket_comments";
CREATE TABLE "ticket_comments" (
  "id" int8 NOT NULL DEFAULT nextval('ticket_comments_id_seq'::regclass),
  "ticket_id" int8 NOT NULL,
  "user_id" int8 NOT NULL,
  "body" text COLLATE "pg_catalog"."default" NOT NULL,
  "attachments" json,
  "created_at" timestamp(0),
  "updated_at" timestamp(0)
)
;

-- ----------------------------
-- Records of ticket_comments
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for tickets
-- ----------------------------
DROP TABLE IF EXISTS "tickets";
CREATE TABLE "tickets" (
  "id" int8 NOT NULL DEFAULT nextval('tickets_id_seq'::regclass),
  "code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "project_id" int8,
  "requester_id" int8 NOT NULL,
  "creator_id" int8 NOT NULL,
  "assignee_id" int8,
  "title" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "status" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "priority" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'medium'::character varying,
  "closed_at" timestamp(0),
  "created_at" timestamp(0),
  "updated_at" timestamp(0),
  "category" varchar(255) COLLATE "pg_catalog"."default",
  "type" varchar(255) COLLATE "pg_catalog"."default",
  "attachments" json,
  "resolved_at" timestamp(0),
  "feedback_rating" int2,
  "feedback_comment" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tickets
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "users";
CREATE TABLE "users" (
  "id" int8 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email_verified_at" timestamp(0),
  "password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "remember_token" varchar(100) COLLATE "pg_catalog"."default",
  "created_at" timestamp(0),
  "updated_at" timestamp(0),
  "unit_id" int8,
  "team" varchar(255) COLLATE "pg_catalog"."default",
  "employee_id" varchar(255) COLLATE "pg_catalog"."default",
  "role" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'member'::character varying,
  "username" varchar(255) COLLATE "pg_catalog"."default",
  "is_active" bool NOT NULL DEFAULT true,
  "supervisor_id" int8,
  "password_changed_at" timestamp(0)
)
;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO "users" ("id", "name", "email", "email_verified_at", "password", "remember_token", "created_at", "updated_at", "unit_id", "team", "employee_id", "role", "username", "is_active", "supervisor_id", "password_changed_at") VALUES (15, 'Rucky Ginanjar', 'rucky.ginanjar@oetomohospital.id', NULL, '$2y$12$qi0E5ApdgWzqTfTGEimireUKa7HrsPL0yhQnPYG2s1OA0U2.oMYEW', NULL, '2026-07-21 03:54:54', '2026-07-22 05:22:06', 10, 'IPSRS', NULL, 'supervisor', 'rucky.ginanjar', 't', NULL, '2026-07-22 05:22:06'), (25, 'Ilman Nurfalah', 'ilman.nurfalah@oetomohospital.id', NULL, '$2y$12$WRaFLHecpKZe5jnglYlaaeTTSmjDozef4xLG/O44UcE7sA53UyzEW', NULL, '2026-08-11 06:51:55', '2026-08-11 06:51:55', 4, NULL, NULL, 'member', 'ilman.nurfalah', 't', NULL, NULL), (16, 'Deni', 'deni@gmaill.com', NULL, '$2y$12$VBG4gblcTsq.evPHFpVOCubh5cpGk3FhOuG6w6gi1TkX7uQsteTQC', NULL, '2026-07-21 04:36:50', '2026-07-21 04:37:21', 1, 'IPSRS', NULL, 'ipsrs', 'deni', 't', NULL, '2026-07-21 04:37:21'), (13, 'Dani Kosasih', 'dani.kosasih@oetomohospital.id', NULL, '$2y$12$lrV86nk2UPkhb9x7NXe/NOZZVGJHwjsObo4ol9k4bXVgXUcVhJWoW', NULL, '2026-07-21 02:57:24', '2026-07-21 04:38:34', 11, 'IT', '24071302', 'supervisor', 'dani.kosasih', 't', NULL, '2026-07-21 04:38:34'), (5, 'Trias Nur Rahayu, S.M', 'dany.kosasih@gmail.com', NULL, '$2y$12$./4vQtYsU22N3j4.2juZ1u3aDT.VhPTRxFbeOnLIXQmVaml9gstWS', NULL, '2026-07-01 09:09:07', '2026-07-21 04:46:17', 6, NULL, '123456', 'member', 'trias.rahayu', 't', NULL, '2026-07-21 04:46:17'), (17, 'Rian Darmawan', 'rian.darmawan@oetomohospital.ida', NULL, '$2y$12$LehoNjJSwmtJn7F4Iy0GZullqrruw58odeoG7wlemjbaMsv2rwIam', 'ppZx7m71D59fAzmNNlzNfpQ3lNzVpIyvYIhrvpuVRP0QAKmSoCie1fZxQiw8', '2026-07-22 04:25:02', '2026-07-22 07:54:28', 10, NULL, NULL, 'supervisor', 'rian.darmawan', 't', NULL, '2026-07-22 07:54:28'), (19, 'Tubagus Yusra Umbara', 'tubagusyusraumbara123@gmail.com', NULL, '$2y$12$a7ZFGe/NpBTUuMFWeQkFje.bTiJkUvlwgIZSBAo/FNZR8VFgvukE2', NULL, '2026-07-23 08:51:59', '2026-07-23 08:51:59', 10, 'IPSRS', '24061367', 'ipsrs', 'yusra', 't', 17, NULL), (20, 'Arif Maulana Ramadan', 'arifmaulanaramadan@gmail.com', NULL, '$2y$12$sDXM2Z4lwnJTtpBeE3jiiOhvUNqrZId0yiEJ5pqu13kSsWbBq86XG', NULL, '2026-07-23 08:53:45', '2026-07-23 08:53:45', 10, 'IPSRS', '25061492', 'ipsrs', 'arif', 't', 17, NULL), (21, 'Heru sugiyanto', 'herusbatam84@gmail.com', NULL, '$2y$12$.R4YagUrRy2M9Sk9fjRoGOVKlaKjA9uw7XwAWC/jQL/HMndlaupm2', NULL, '2026-07-23 09:03:43', '2026-07-23 09:03:43', 10, 'IPSRS', '26061571', 'ipsrs', 'heru', 't', 17, NULL), (22, 'Enjang tasa', 'enjangtasa78@gmail.com', NULL, '$2y$12$/RO3vzcUMyWUBwXiFtlDSOLZ72F3ga30UTWE0C1JrTXp2TBDmfUs.', NULL, '2026-07-23 09:31:36', '2026-07-23 09:31:36', 10, 'IPSRS', '24061143', 'ipsrs', 'enjang', 't', 17, NULL), (23, 'Wisnu kusmawan', 'wisnukusmawan34@gmail.com', NULL, '$2y$12$RbB/FGM42r.VO4H.fbjwfu0dyJziU2ajG.lAmArI3LJ6vA1LevbNO', NULL, '2026-07-23 09:32:53', '2026-07-23 09:32:53', 10, 'IPSRS', '25061497', 'ipsrs', 'Wisnu', 't', 17, NULL), (24, 'Farrel Akheyla Devano Hidayat', 'akheylarel@gmail.com', NULL, '$2y$12$Sgkn48SR.qeOjrO6MOq7PeT5eGWkGhyZFbzBWzAY65p039DV2abTW', NULL, '2026-07-23 09:35:54', '2026-07-23 09:35:54', 10, 'IPSRS', '26061595', 'ipsrs', 'Farrel', 't', 17, NULL), (14, 'Rizal Prananda', 'rizal.prananda@oetomohospital.id', NULL, '$2y$12$5qnOQa5dpKRUb1tmbRX7..TbLgLIglXBuCOMYsZT4OptxDrTIqx7C', '0YM0n21ZbPrDJvnlhYTrN5RY3w7bO1W8UN3a5hqp9ipu40pSKyx3BOlFgvV7', '2026-07-21 02:59:06', '2026-08-11 04:42:46', 11, 'IT', NULL, 'it', 'rizal.prananda', 't', 13, '2026-08-11 04:42:46'), (4, 'Administrator', 'simrs@oetomohospital.id', '2026-07-01 09:48:33', '$2y$12$UUHlqegu4f1.XQKuHnmm4.6EPYHTxnxOeA7EQE3EUCi7lsmPA48fa', 'yyYFY4FQCDEUhsKZSRuHbpQurONoh8UEaPCVSCNMh9AvHe3j5Y6uxGTigHQw', '2026-07-01 08:05:27', '2026-08-11 06:46:06', 1, NULL, NULL, 'admin', 'admin', 't', NULL, '2026-08-11 06:46:06'), (26, 'Syifaa Ainun Nissa', 'syifa.ainun@oetomohospital.id', NULL, '$2y$12$DXWQsXFVcH9CIMbGkVpE/O49TN.Amr9ieEtL/1V.5.V2Y3vvV4pqa', NULL, '2026-08-11 07:51:18', '2026-08-11 07:51:18', 15, NULL, NULL, 'member', 'syifa.ainun', 't', NULL, NULL), (27, 'Laboratorium', 'laboratorium@oetomohospital.id', NULL, '$2y$12$LOnATOeSF8lPVIDgSISbdO3sHJSSfHEVRIkCYK43dl6bRKuVlOCR.', NULL, '2026-08-11 07:52:14', '2026-08-11 07:52:14', 8, NULL, NULL, 'member', 'laboratorium', 't', NULL, NULL), (28, 'Poliklinik', 'poli@oetomohospital.id', NULL, '$2y$12$AphaiK3KafPrj8W3wrIjj.1drK1.8sznKM.hSw70TAchUIzoKT456', NULL, '2026-08-11 07:53:05', '2026-08-11 07:53:05', 4, NULL, NULL, 'member', 'poli', 't', NULL, NULL), (30, 'Rehab', 'rehab@oetomohospital.id', NULL, '$2y$12$LvfYgrzRoT8szC87lpHu6usft5FrVxI3HfydGiAoSRLiy1k3Eizqq', NULL, '2026-08-11 07:54:41', '2026-08-11 07:54:41', 30, NULL, NULL, 'member', 'rehab', 't', NULL, NULL), (31, 'Admission', 'admission_pelayanan@oetomohospital.id', NULL, '$2y$12$y7hiJtm.s0H6L3FNNQYhle85GQPK3xxpKAOsKWroFabXxZ8GtfR56', NULL, '2026-08-11 07:55:09', '2026-08-11 07:55:09', 16, NULL, NULL, 'member', 'admission', 't', NULL, NULL), (6, 'Fakhriza', 'dany.kosasih@hotmail.com', NULL, '$2y$12$GOCc.jT.UBJMQi2m1zf7wOCssDdiyllvm3OxqhH8NrrzO7TDELe5S', '2g8K9mFpy8IGJgX2DkSqTpoy1JSy7jQbIPeEIi5W8yjHpHemYI6tzg0raXqN', '2026-07-01 09:16:04', '2026-08-11 04:43:03', 11, 'IT', '12', 'it', 'fakhriza', 't', 13, '2026-08-11 04:43:03'), (29, 'Casemix', 'casemix@oetomohospital.id', NULL, '$2y$12$NYPI0IzlsqOQyugP6LdaW.tswVU2TiXbg/PjFbYMPFg8mWsTdksMq', 'JjPACN8jqZNIhZloiQNL7htV784bbCoVvB9l2Au9f7W4DDmydymK1VfSO4lH', '2026-08-11 07:53:53', '2026-08-12 04:46:36', 18, NULL, NULL, 'member', 'casemix', 't', NULL, NULL), (32, 'Ratna Dewi', 'ratna.dewi@oetomohospital.id', NULL, '$2y$12$RveR5i/YXZqW8/3uHERJ9ub0XQj6ssoELIuIfPsHAFaAJRvqq5QEO', NULL, '2026-08-13 01:21:42', '2026-08-13 01:21:42', 13, NULL, NULL, 'member', 'ratna.dewi', 't', NULL, NULL), (33, 'Ranap 7', 'ranap7.oetomo@gmail.com', NULL, '$2y$12$JQzMTbTfAND6Xu08r4meRueC6HQhFqL/HduwF9FW47x8zGjMs1fXq', NULL, '2026-08-13 01:32:42', '2026-08-13 01:32:42', 3, NULL, NULL, 'member', 'ranap7', 't', NULL, NULL);
COMMIT;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "failed_jobs_id_seq"
OWNED BY "failed_jobs"."id";
SELECT setval('"failed_jobs_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "jobs_id_seq"
OWNED BY "jobs"."id";
SELECT setval('"jobs_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "migrations_id_seq"
OWNED BY "migrations"."id";
SELECT setval('"migrations_id_seq"', 20, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "projects_id_seq"
OWNED BY "projects"."id";
SELECT setval('"projects_id_seq"', 34, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "ticket_comments_id_seq"
OWNED BY "ticket_comments"."id";
SELECT setval('"ticket_comments_id_seq"', 16, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "tickets_id_seq"
OWNED BY "tickets"."id";
SELECT setval('"tickets_id_seq"', 22, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "users_id_seq"
OWNED BY "users"."id";
SELECT setval('"users_id_seq"', 33, true);

-- ----------------------------
-- Indexes structure for table cache
-- ----------------------------
CREATE INDEX "cache_expiration_index" ON "cache" USING btree (
  "expiration" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table cache
-- ----------------------------
ALTER TABLE "cache" ADD CONSTRAINT "cache_pkey" PRIMARY KEY ("key");

-- ----------------------------
-- Indexes structure for table cache_locks
-- ----------------------------
CREATE INDEX "cache_locks_expiration_index" ON "cache_locks" USING btree (
  "expiration" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table cache_locks
-- ----------------------------
ALTER TABLE "cache_locks" ADD CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key");

-- ----------------------------
-- Uniques structure for table failed_jobs
-- ----------------------------
ALTER TABLE "failed_jobs" ADD CONSTRAINT "failed_jobs_uuid_unique" UNIQUE ("uuid");

-- ----------------------------
-- Primary Key structure for table failed_jobs
-- ----------------------------
ALTER TABLE "failed_jobs" ADD CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table job_batches
-- ----------------------------
ALTER TABLE "job_batches" ADD CONSTRAINT "job_batches_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table jobs
-- ----------------------------
CREATE INDEX "jobs_queue_index" ON "jobs" USING btree (
  "queue" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table jobs
-- ----------------------------
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table migrations
-- ----------------------------
ALTER TABLE "migrations" ADD CONSTRAINT "migrations_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table notifications
-- ----------------------------
CREATE INDEX "notifications_notifiable_type_notifiable_id_index" ON "notifications" USING btree (
  "notifiable_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "notifiable_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table notifications
-- ----------------------------
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table password_reset_tokens
-- ----------------------------
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("email");

-- ----------------------------
-- Uniques structure for table projects
-- ----------------------------
ALTER TABLE "projects" ADD CONSTRAINT "projects_code_unique" UNIQUE ("code");

-- ----------------------------
-- Primary Key structure for table projects
-- ----------------------------
ALTER TABLE "projects" ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table sessions
-- ----------------------------
CREATE INDEX "sessions_last_activity_index" ON "sessions" USING btree (
  "last_activity" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table sessions
-- ----------------------------
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ticket_comments
-- ----------------------------
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table tickets
-- ----------------------------
CREATE INDEX "tickets_closed_at_index" ON "tickets" USING btree (
  "closed_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "tickets_priority_index" ON "tickets" USING btree (
  "priority" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "tickets_requester_id_status_created_at_index" ON "tickets" USING btree (
  "requester_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "tickets_resolved_at_index" ON "tickets" USING btree (
  "resolved_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "tickets_status_index" ON "tickets" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table tickets
-- ----------------------------
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_code_unique" UNIQUE ("code");

-- ----------------------------
-- Primary Key structure for table tickets
-- ----------------------------
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE INDEX "users_is_active_index" ON "users" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "users_role_index" ON "users" USING btree (
  "role" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "users_team_index" ON "users" USING btree (
  "team" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table users
-- ----------------------------
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_unique" UNIQUE ("employee_id");
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE ("username");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table ticket_comments
-- ----------------------------
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_foreign" FOREIGN KEY ("ticket_id") REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tickets
-- ----------------------------
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_foreign" FOREIGN KEY ("assignee_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creator_id_foreign" FOREIGN KEY ("creator_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_project_id_foreign" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_requester_id_foreign" FOREIGN KEY ("requester_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table users
-- ----------------------------
ALTER TABLE "users" ADD CONSTRAINT "users_supervisor_id_foreign" FOREIGN KEY ("supervisor_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "users" ADD CONSTRAINT "users_unit_id_foreign" FOREIGN KEY ("unit_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
