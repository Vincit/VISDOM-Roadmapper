--
-- PostgreSQL database dump
--

-- Dumped from database version 11.10 (Debian 11.10-1.pgdg90+1)
-- Dumped by pg_dump version 13.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer (
    id integer NOT NULL,
    "roadmapId" integer,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    color character varying(7) NOT NULL,
    weight real DEFAULT '1'::real NOT NULL
);


--
-- Name: customerRepresentative; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."customerRepresentative" (
    "userId" integer NOT NULL,
    "customerId" integer NOT NULL
);


--
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_id_seq OWNED BY public.customer.id;


--
-- Name: emailVerification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."emailVerification" (
    "userId" integer NOT NULL,
    uuid uuid,
    email character varying(255),
    "updatedAt" timestamp with time zone
);


--
-- Name: hotSwappableUsers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."hotSwappableUsers" (
    id integer NOT NULL,
    "fromUserId" integer,
    "toUserId" integer
);


--
-- Name: hotSwappableUsers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."hotSwappableUsers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hotSwappableUsers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."hotSwappableUsers_id_seq" OWNED BY public."hotSwappableUsers".id;


--
-- Name: importStatusMapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."importStatusMapping" (
    id integer NOT NULL,
    "integrationId" integer,
    "fromColumn" character varying(75) NOT NULL,
    "toStatus" integer NOT NULL
);


--
-- Name: integration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration (
    id integer NOT NULL,
    name character varying(250) NOT NULL,
    host character varying(250) NOT NULL,
    consumerkey character varying(250) NOT NULL,
    privatekey character varying(2048) NOT NULL,
    "roadmapId" integer NOT NULL,
    "boardId" character varying(255)
);


--
-- Name: integration_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.integration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: integration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.integration_id_seq OWNED BY public.integration.id;


--
-- Name: invitationRepresentative; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."invitationRepresentative" (
    "invitationId" uuid NOT NULL,
    "customerId" integer NOT NULL
);


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invitations (
    id uuid NOT NULL,
    "roadmapId" integer,
    type integer,
    email character varying(255),
    "updatedAt" timestamp with time zone
);


--
-- Name: jiraconfigurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jiraconfigurations (
    id integer NOT NULL,
    url character varying(250) NOT NULL,
    privatekey character varying(2048) NOT NULL,
    "roadmapId" integer NOT NULL
);


--
-- Name: jiraconfigurations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jiraconfigurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jiraconfigurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jiraconfigurations_id_seq OWNED BY public.jiraconfigurations.id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: passwordResetToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."passwordResetToken" (
    "userId" integer NOT NULL,
    uuid uuid,
    "updatedAt" timestamp with time zone
);


--
-- Name: roadmaps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roadmaps (
    id integer NOT NULL,
    name character varying(255),
    description text,
    "daysPerWorkCalibration" real
);


--
-- Name: roadmaps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roadmaps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roadmaps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roadmaps_id_seq OWNED BY public.roadmaps.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    "userId" integer NOT NULL,
    "roadmapId" integer NOT NULL,
    type integer
);


--
-- Name: taskratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taskratings (
    id integer NOT NULL,
    dimension integer,
    value real,
    comment text DEFAULT ''::text,
    "parentTask" integer NOT NULL,
    "createdByUser" integer,
    "forCustomer" integer
);


--
-- Name: taskratings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.taskratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: taskratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.taskratings_id_seq OWNED BY public.taskratings.id;


--
-- Name: taskrelation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taskrelation (
    "from" integer NOT NULL,
    "to" integer NOT NULL,
    type integer NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    name character varying(255),
    description text,
    "createdAt" timestamp with time zone,
    "roadmapId" integer NOT NULL,
    "createdByUser" integer,
    "externalId" character varying(255),
    "importedFrom" character varying(255),
    "externalLink" character varying(255),
    status integer DEFAULT 0 NOT NULL,
    "lastUpdatedByUserId" integer,
    "updatedAt" timestamp with time zone
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tokens (
    id integer NOT NULL,
    provider character varying(75) NOT NULL,
    instance character varying(75) NOT NULL,
    type character varying(75) NOT NULL,
    value character varying(250) NOT NULL,
    "user" integer NOT NULL,
    "forIntegration" integer
);


--
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tokens_id_seq OWNED BY public.tokens.id;


--
-- Name: trelloColumnMappings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."trelloColumnMappings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trelloColumnMappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."trelloColumnMappings_id_seq" OWNED BY public."importStatusMapping".id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255),
    password character varying(75),
    "authToken" uuid,
    "defaultRoadmapId" integer,
    "emailVerified" boolean DEFAULT false NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: versionTasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."versionTasks" (
    "versionId" integer NOT NULL,
    "taskId" integer NOT NULL,
    "order" integer
);


--
-- Name: versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.versions (
    id integer NOT NULL,
    "roadmapId" integer,
    name character varying(75),
    "sortingRank" integer NOT NULL
);


--
-- Name: versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.versions_id_seq OWNED BY public.versions.id;


--
-- Name: customer id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer ALTER COLUMN id SET DEFAULT nextval('public.customer_id_seq'::regclass);


--
-- Name: hotSwappableUsers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."hotSwappableUsers" ALTER COLUMN id SET DEFAULT nextval('public."hotSwappableUsers_id_seq"'::regclass);


--
-- Name: importStatusMapping id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."importStatusMapping" ALTER COLUMN id SET DEFAULT nextval('public."trelloColumnMappings_id_seq"'::regclass);


--
-- Name: integration id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration ALTER COLUMN id SET DEFAULT nextval('public.integration_id_seq'::regclass);


--
-- Name: jiraconfigurations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jiraconfigurations ALTER COLUMN id SET DEFAULT nextval('public.jiraconfigurations_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: roadmaps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmaps ALTER COLUMN id SET DEFAULT nextval('public.roadmaps_id_seq'::regclass);


--
-- Name: taskratings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskratings ALTER COLUMN id SET DEFAULT nextval('public.taskratings_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.tokens_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions ALTER COLUMN id SET DEFAULT nextval('public.versions_id_seq'::regclass);


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.customer (id, "roadmapId", name, email, color, weight) VALUES (15, 17, 'SlowSnail Corporate Oyj', 'slo@snail.com', '#994DFF', 1.5);
INSERT INTO public.customer (id, "roadmapId", name, email, color, weight) VALUES (13, 17, 'Daas Company', 'daas@company.com', '#FF4D57', 0.75);
INSERT INTO public.customer (id, "roadmapId", name, email, color, weight) VALUES (14, 17, 'Greatness to Be Gmbh', 'gg@gg.gg', '#5DF4D0', 1.75);


--
-- Data for Name: customerRepresentative; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."customerRepresentative" ("userId", "customerId") VALUES (52, 13);
INSERT INTO public."customerRepresentative" ("userId", "customerId") VALUES (54, 14);
INSERT INTO public."customerRepresentative" ("userId", "customerId") VALUES (52, 15);
INSERT INTO public."customerRepresentative" ("userId", "customerId") VALUES (54, 13);
INSERT INTO public."customerRepresentative" ("userId", "customerId") VALUES (51, 14);
INSERT INTO public."customerRepresentative" ("userId", "customerId") VALUES (51, 13);


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (1, '20200526111701_initialSchema.ts', 1, '2021-12-03 13:04:46.3+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (2, '20200812104946_versionsUniqueName.ts', 1, '2021-12-03 13:04:46.438+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (3, '20200817095644_sortableVersions.ts', 1, '2021-12-03 13:04:46.444+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (4, '20201015111336_jiraid.ts', 1, '2021-12-03 13:04:46.45+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (5, '20201117163859_jiraIntegrations.ts', 1, '2021-12-03 13:04:46.487+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (6, '20210111124846_hotswapUsers.ts', 1, '2021-12-03 13:04:46.507+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (7, '20210215111533_addAuthToken.ts', 1, '2021-12-03 13:04:46.514+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (8, '20210329170939_addUserRoles.ts', 1, '2021-12-03 13:04:46.53+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (9, '20210422112638_addVersionTaskTable.ts', 1, '2021-12-03 13:04:46.558+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (10, '20210507102740_removeTasksJoinTable.ts', 1, '2021-12-03 13:04:46.565+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (11, '20210510160632_addCustomerModel.ts', 1, '2021-12-03 13:04:46.586+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (12, '20210511113456_removeHotSwapUsers.ts', 1, '2021-12-03 13:04:46.588+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (13, '20210525145930_caseInsensitiveUsernameAndEmail.ts', 1, '2021-12-03 13:04:46.601+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (14, '20210528125152_addCustomerToTaskratingUniqueConstraint.ts', 1, '2021-12-03 13:04:46.607+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (15, '20210531133549_adjustColumnLengthConstraints.ts', 1, '2021-12-03 13:04:46.636+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (16, '20210608135226_serviceIntegrations.ts', 1, '2021-12-03 13:04:46.651+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (17, '20210609170207_addIntegrationTable.ts', 1, '2021-12-03 13:04:46.674+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (18, '20210618095356_requireCustomerColor.ts', 1, '2021-12-03 13:04:46.679+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (19, '20210618132417_removeUserType.ts', 1, '2021-12-03 13:04:46.681+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (20, '20210621130438_customerValueToWeight.ts', 1, '2021-12-03 13:04:46.684+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (21, '20210630154740_requireCustomerEmail.ts', 1, '2021-12-03 13:04:46.689+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (22, '20210713135033_addRoadmapIdCascadeOnDelete.ts', 1, '2021-12-03 13:04:46.701+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (23, '20210715135729_customerWeightToFloat.ts', 1, '2021-12-03 13:04:46.715+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (24, '20210719114220_addCustomerIdCascadeOnDelete.ts', 1, '2021-12-03 13:04:46.723+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (25, '20210816092729_addDefaultRoadmapColumnToUser.ts', 1, '2021-12-03 13:04:46.732+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (26, '20210816112955_addInvitations.ts', 1, '2021-12-03 13:04:46.746+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (27, '20210823150208_taskRelations.ts', 1, '2021-12-03 13:04:46.756+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (28, '20210908133847_emailVerification.ts', 1, '2021-12-03 13:04:46.772+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (29, '20211008131624_removeUsername.ts', 1, '2021-12-03 13:04:46.774+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (30, '20211021141414_addTimestampAndUniqueConstraintToInvitations.ts', 1, '2021-12-03 13:04:46.78+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (31, '20220111090109_workTimeCalibration.ts', 2, '2022-01-13 11:59:12.932+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (32, '20220117144935_passwordReset.ts', 3, '2022-01-20 08:29:59.406+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (33, '20220118113427_addRepresentedToInvitations.ts', 4, '2022-02-04 11:40:00.691+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (34, '20220208124324_fixTaskImportConstraint.ts', 5, '2022-02-09 10:43:12.134+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (35, '20220209093644_rescaleRatings.ts', 5, '2022-02-09 10:43:12.141+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (36, '20220209130348_scaleRatingsFix.ts', 6, '2022-02-09 11:19:06.557+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (37, '20220310091901_integrationsRework.ts', 7, '2022-03-22 11:32:35.904+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (38, '20220310110218_nullableUserReferenceInTaskrating.ts', 7, '2022-03-22 11:32:36.035+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (39, '20220321063937_businessUsersTaskCreate.ts', 7, '2022-03-22 11:32:36.111+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (40, '20220328082207_taskEditTimestamp.ts', 8, '2022-04-04 07:31:38.77+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (41, '20220328112527_fixIntegrationTokenForeignKey.ts', 8, '2022-04-04 07:31:38.884+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (42, '20220328122849_BusinessAndDeveloperUsersEditRelations.ts', 8, '2022-04-04 07:31:38.951+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (43, '20220405141146_renameTrelloColumns.ts', 9, '2022-04-06 13:18:56.774+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (44, '20220420080810_addPermissionVersionReadToBusinessRole.ts', 10, '2022-04-26 12:08:00.251+00');
INSERT INTO public.knex_migrations (id, name, batch, migration_time) VALUES (45, '20220513081959_addPermissionRoadmapReadCustomerValuesToBusinessRole.ts', 11, '2022-05-17 07:39:12.163+00');


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.knex_migrations_lock (index, is_locked) VALUES (1, 0);

--
-- Data for Name: roadmaps; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roadmaps (id, name, description, "daysPerWorkCalibration") VALUES (17, 'Demoprojekti 2', 'Projekti toista käyttäjätestausiteraatiota varten', NULL);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles ("userId", "roadmapId", type) VALUES (9, 17, -1);
INSERT INTO public.roles ("userId", "roadmapId", type) VALUES (51, 17, -1);
INSERT INTO public.roles ("userId", "roadmapId", type) VALUES (57, 17, -1);
INSERT INTO public.roles ("userId", "roadmapId", type) VALUES (55, 17, 8668323);
INSERT INTO public.roles ("userId", "roadmapId", type) VALUES (56, 17, 8668323);
INSERT INTO public.roles ("userId", "roadmapId", type) VALUES (52, 17, 10240695);
INSERT INTO public.roles ("userId", "roadmapId", type) VALUES (54, 17, 10240695);
INSERT INTO public.roles ("userId", "roadmapId", type) VALUES (58, 17, 10240695);


--
-- Data for Name: taskratings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (325, 0, 1, '', 405, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (329, 0, 2, '', 401, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (332, 0, 2, '', 398, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (334, 0, 2, '', 396, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (337, 0, 3, '', 393, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (338, 0, 1, '', 392, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (339, 0, 2, '', 391, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (343, 0, 1, '', 387, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (346, 0, 1, '', 384, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (347, 0, 2, '', 405, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (348, 0, 1, '', 405, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (349, 0, 2, '', 404, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (350, 0, 4, '', 404, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (351, 0, 1, '', 403, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (352, 0, 1, '', 403, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (363, 0, 3, '', 397, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (364, 0, 3, '', 397, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (365, 0, 3, '', 396, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (366, 0, 2, '', 396, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (367, 0, 4, '', 395, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (368, 0, 3, '', 395, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (369, 0, 4, '', 394, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (370, 0, 4, '', 394, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (371, 0, 3, '', 393, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (372, 0, 3, '', 393, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (373, 0, 1, '', 392, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (374, 0, 1, '', 392, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (375, 0, 3, '', 391, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (376, 0, 2, '', 391, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (381, 0, 1, '', 388, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (382, 0, 1, '', 388, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (383, 0, 1, '', 387, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (384, 0, 1, '', 387, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (393, 1, 2, '', 403, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (401, 1, 4, '', 395, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (404, 1, 2, '', 392, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (406, 1, 4, '', 390, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (409, 1, 1, '', 387, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (415, 0, 2, '', 403, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (418, 0, 5, '', 400, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (420, 0, 3, '', 398, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (424, 0, 2, '', 394, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (427, 0, 2, '', 391, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (429, 0, 4, '', 389, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (431, 0, 1, '', 387, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (433, 0, 1, '', 385, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (326, 0, 2, '', 404, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (328, 0, 4, '', 402, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (331, 0, 4, '', 399, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (333, 0, 3, '', 397, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (335, 0, 2, '', 395, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (340, 0, 3, '', 390, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (342, 0, 1, '', 388, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (345, 0, 1, '', 385, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (353, 0, 2, '', 402, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (354, 0, 4, '', 402, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (355, 0, 3, '', 401, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (356, 0, 1, '', 401, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (357, 0, 3, '', 400, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (358, 0, 3, '', 400, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (359, 0, 1, '', 399, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (360, 0, 4, '', 399, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (377, 0, 2, '', 390, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (378, 0, 4, '', 390, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (379, 0, 1, '', 389, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (380, 0, 3, '', 389, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (385, 0, 1, '', 386, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (386, 0, 1, '', 386, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (387, 0, 1, '', 385, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (388, 0, 1, '', 385, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (389, 0, 1, '', 384, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (390, 0, 1, '', 384, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (391, 1, 2, '', 405, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (395, 1, 5, '', 401, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (397, 1, 2, '', 399, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (399, 1, 4, '', 397, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (403, 1, 3, '', 393, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (407, 1, 3, '', 389, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (411, 1, 1, '', 385, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (413, 0, 2, '', 405, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (416, 0, 5, '', 402, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (421, 0, 4, '', 397, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (423, 0, 3, '', 395, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (425, 0, 2, '', 393, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (434, 0, 1, '', 384, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (327, 0, 1, '', 403, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (330, 0, 4, '', 400, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (336, 0, 4, '', 394, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (341, 0, 3, '', 389, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (344, 0, 2, '', 386, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (361, 0, 3, '', 398, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (362, 0, 2, '', 398, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (392, 1, 4, '', 404, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (394, 1, 4, '', 402, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (396, 1, 4, '', 400, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (398, 1, 2, '', 398, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (400, 1, 4, '', 396, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (402, 1, 2, '', 394, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (405, 1, 1, '', 391, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (408, 1, 2, '', 388, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (410, 1, 1, '', 386, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (412, 1, 1, '', 384, 55, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (414, 0, 4, '', 404, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (417, 0, 4, '', 401, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (419, 0, 5, '', 399, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (422, 0, 2, '', 396, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (426, 0, 1, '', 392, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (428, 0, 4, '', 390, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (430, 0, 1, '', 388, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (432, 0, 1, '', 386, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (835, 1, 1, '', 384, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (836, 1, 1, '', 385, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (837, 1, 2, '', 386, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (838, 1, 3, '', 403, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (839, 1, 5, '', 400, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (840, 1, 2, '', 392, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (841, 1, 5, '', 390, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (842, 1, 4, '', 389, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (843, 1, 2, '', 388, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (844, 1, 1, '', 387, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (845, 1, 2, '', 393, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (846, 1, 5, '', 401, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (848, 1, 4, '', 397, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (849, 1, 2, '', 391, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (850, 1, 2, '', 394, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (851, 1, 2, '', 398, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (852, 1, 3, '', 399, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (853, 1, 4, '', 396, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (854, 1, 5, '', 395, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (855, 1, 2, '', 405, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (856, 1, 4, '', 404, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (847, 1, 4, '', 402, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (929, 0, 5, 'Prevents from proceeding', 970, 51, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (931, 0, 5, 'They deem this feature very
desirable in the roadmapper tool and consider it their highest desire for future releases.', 971, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (932, 0, 1, 'They don''t need this', 972, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (933, 0, 4, 'Needed to fully adopt roadmapper for their development', 972, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (934, 0, 4, '', 970, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (935, 0, 4, '', 970, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (930, 0, 2, '', 970, 51, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (936, 0, 3, '', 970, 54, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (937, 0, 2, '', 970, 54, 14);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (938, 1, 4, 'Not quite a walk in the park', 970, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (939, 1, 3, '', 972, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (940, 1, 3, '', 971, 56, NULL);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (941, 0, 2, '', 972, 52, 13);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (942, 0, 1, '', 972, 52, 15);
INSERT INTO public.taskratings (id, dimension, value, comment, "parentTask", "createdByUser", "forCustomer") VALUES (943, 0, 1, '', 971, 52, 13);


--
-- Data for Name: taskrelation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.taskrelation ("from", "to", type) VALUES (401, 390, 0);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (395, 399, 0);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (389, 399, 0);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (389, 397, 0);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (384, 392, 0);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (404, 402, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (402, 404, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (399, 398, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (398, 399, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (397, 399, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (399, 397, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (397, 398, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (398, 397, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (395, 400, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (400, 395, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (392, 394, 0);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (386, 385, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (385, 386, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (387, 386, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (386, 387, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (387, 385, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (385, 387, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (384, 386, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (386, 384, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (384, 385, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (385, 384, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (384, 387, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (387, 384, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (389, 393, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (393, 389, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (388, 387, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (387, 388, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (388, 386, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (386, 388, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (388, 385, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (385, 388, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (388, 384, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (384, 388, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (387, 392, 0);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (405, 396, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (396, 405, 1);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (970, 387, 0);
INSERT INTO public.taskrelation ("from", "to", type) VALUES (971, 972, 0);


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (384, 'Fix CSS of task map in production builds', 'No description', '2022-02-15 07:51:57+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (385, 'Fix errors appearing in console on planner page', 'No description', '2022-02-15 07:51:46+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (386, 'Improve responsiveness of table components for small monitors', 'No description', '2022-02-15 07:39:13+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (387, 'Fix planner milestone visualization scaling at certain client weights', 'No description', '2022-02-15 10:35:33+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (388, 'Fix task map dependency dragging when both tasks dont fit on the screen', 'No description', '2022-02-15 10:36:54+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (389, 'Improve task heatmap visualization clarity', 'No description', '2022-02-15 07:36:44+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (390, 'Add a way to visualize technical debt', 'No description', '2022-02-15 07:36:53+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (391, 'Track status of tasks more precisely than "completed" or "not completed"', 'No description', '2022-02-15 07:37:16+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (392, 'Refactor frontend state to use RTK-query', 'No description', '2022-02-15 07:37:32+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (393, 'Add a way to filter tasks that are to be included in task map', 'No description', '2022-02-15 07:38:46+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (394, 'Update front end in realtime over websocket (collaborative editing)', 'No description', '2022-02-15 07:39:59+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (395, 'Validate planner tabs milestone order based on task map dependency graph', 'No description', '2022-02-15 07:41:55+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (396, 'Rework integrations to use one oauth per roadmap', 'No description', '2022-02-15 07:45:07+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (397, 'Work-time estimation based on statistics from previously completed task', 'No description', '2022-02-15 07:45:38+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (398, 'Visualize milestone completedness %', 'No description', '2022-02-15 07:46:02+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (399, 'Add "customer dashboard" page', 'No description', '2022-02-15 07:52:26+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (400, 'Visualize task dependencies & synergies in planner', 'No description', '2022-02-15 07:53:17+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (401, 'Use task dependencies & relations in automatic priority calculations', 'No description', '2022-02-15 07:53:35+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (402, 'Visualize current customer weight adjustments relative portions in planner', 'No description', '2022-02-15 07:55:04+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (403, 'Email message html templates for password recovery, reminders, confirmation email etc.', 'No description', '2022-02-15 07:50:55+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (404, 'Rework visualization for milestones'' "customer value created"', 'No description', '2022-02-15 07:50:24+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (405, 'Separate integration configs to their own page/section', 'No description', '2022-02-15 07:49:57+00', 17, 9, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (970, 'Fix milestone deadlocking', 'Fix milestone deadlocking when adding a task with no ratings and when the ratings are added', '2022-05-11 08:44:58.331+00', 17, 51, NULL, NULL, NULL, 2, NULL, '2022-05-11 10:01:38.208+00');
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (971, 'Create a summary printout/pdf of the planned roadmap', 'Printout is distributed in their bureucratic chaing of command. They deem this feature very
desirable in the roadmapper tool and consider it their highest desire for future releases.', '2022-05-11 08:47:33.846+00', 17, 52, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO public.tasks (id, name, description, "createdAt", "roadmapId", "createdByUser", "externalId", "importedFrom", "externalLink", status, "lastUpdatedByUserId", "updatedAt") VALUES (972, 'GitLab issue import integration', 'We need to be able to import GitLab issues as a data source. This has been requested by Greatness to Be.', '2022-05-11 08:47:43.51+00', 17, 54, NULL, NULL, NULL, 0, NULL, NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, email, password, "authToken", "defaultRoadmapId", "emailVerified") VALUES (9, 'demo.user@example.com', '$2b$12$EKFuykKWCNCuzTJ8vWj5HevvzDZ2T30gZ1Ci3r06yNen7jeUTDeUa', NULL, NULL, true);
INSERT INTO public.users (id, email, password, "authToken", "defaultRoadmapId", "emailVerified") VALUES (51, 'demo.user+projectowner@example.com', '$2b$12$x48f1e5F5AkjjyAPS9yRiej5cKzLzF/xLs4XuIP5ftplNBYJwuSYG', NULL, NULL, true);
INSERT INTO public.users (id, email, password, "authToken", "defaultRoadmapId", "emailVerified") VALUES (52, 'demo.user+sales1@example.com', '$2b$12$zdIn/xRVcmLcrg.r7ebMy.L/RM/kCo2eJj1gWLbmKIEX5nur15HV2', NULL, NULL, true);
INSERT INTO public.users (id, email, password, "authToken", "defaultRoadmapId", "emailVerified") VALUES (55, 'demo.user+developer1@example.com', '$2b$12$kYEMxrpwqlA9I0jLBEVvxuyIh7dyARHzfEEWRT7eCj2GtmRilwDU2', NULL, NULL, true);
INSERT INTO public.users (id, email, password, "authToken", "defaultRoadmapId", "emailVerified") VALUES (56, 'demo.user+developer2@example.com', '$2b$12$N0zDsXkQNXjaAlGgKx0YsewEXTQsEcV2PX1JnkcVOuQvTrnxGFDrm', NULL, NULL, true);
INSERT INTO public.users (id, email, password, "authToken", "defaultRoadmapId", "emailVerified") VALUES (57, 'demo.user+observer@example.com', '$2b$12$nsEDgIWnJvDtg6GdhyKWE.LF.AIgrF5t6Tb5oFxl8jXbYPR3AOluG', NULL, NULL, true);
INSERT INTO public.users (id, email, password, "authToken", "defaultRoadmapId", "emailVerified") VALUES (58, 'demo.user+sales3@example.com', '$2b$12$/L2kw7gswkBk5Yl71KgJeueLuhv1Ox0/VNgHvvZDnqK3w20DbGTRG', NULL, NULL, true);
INSERT INTO public.users (id, email, password, "authToken", "defaultRoadmapId", "emailVerified") VALUES (54, 'demo.user+sales2@example.com', '$2b$12$.usdgN7OLDaet1ZxWg0.9eGYjzaMU8seKbOOW2EhKiq/so1p2xg7y', NULL, NULL, true);


--
-- Data for Name: versionTasks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (73, 970, 0);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (48, 395, 2);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (47, 396, 0);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (47, 405, 1);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (48, 399, 5);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (47, 972, 2);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (46, 394, 0);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (46, 397, 1);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (46, 398, 2);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (46, 391, 3);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (46, 390, 4);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (47, 971, 3);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (70, 404, 0);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (70, 385, 1);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (70, 393, 2);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (70, 388, 3);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (70, 403, 4);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (70, 386, 5);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (70, 387, 6);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (70, 384, 7);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (74, 402, 0);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (74, 401, 1);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (74, 392, 2);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (74, 400, 3);
INSERT INTO public."versionTasks" ("versionId", "taskId", "order") VALUES (74, 389, 4);


--
-- Data for Name: versions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.versions (id, "roadmapId", name, "sortingRank") VALUES (47, 17, 'Collaborative editing', 1);
INSERT INTO public.versions (id, "roadmapId", name, "sortingRank") VALUES (73, 17, 'Urgent fix', 0);
INSERT INTO public.versions (id, "roadmapId", name, "sortingRank") VALUES (48, 17, 'Task dependencies & visualizations', 3);
INSERT INTO public.versions (id, "roadmapId", name, "sortingRank") VALUES (46, 17, 'Technical debt visualization', 5);
INSERT INTO public.versions (id, "roadmapId", name, "sortingRank") VALUES (70, 17, 'Fixes & refactors', 2);
INSERT INTO public.versions (id, "roadmapId", name, "sortingRank") VALUES (74, 17, 'Yet another milestone', 4);


--
-- Name: customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_id_seq', 20, true);


--
-- Name: hotSwappableUsers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."hotSwappableUsers_id_seq"', 1, false);


--
-- Name: integration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.integration_id_seq', 13, true);


--
-- Name: jiraconfigurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jiraconfigurations_id_seq', 1, false);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 45, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: roadmaps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roadmaps_id_seq', 22, true);


--
-- Name: taskratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.taskratings_id_seq', 943, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tasks_id_seq', 974, true);


--
-- Name: tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tokens_id_seq', 18, true);


--
-- Name: trelloColumnMappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."trelloColumnMappings_id_seq"', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 73, true);


--
-- Name: versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.versions_id_seq', 78, true);


--
-- Name: customerRepresentative customerRepresentative_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."customerRepresentative"
    ADD CONSTRAINT "customerRepresentative_pkey" PRIMARY KEY ("userId", "customerId");


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: emailVerification emailVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."emailVerification"
    ADD CONSTRAINT "emailVerification_pkey" PRIMARY KEY ("userId");


--
-- Name: emailVerification emailverification_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."emailVerification"
    ADD CONSTRAINT emailverification_uuid_unique UNIQUE (uuid);


--
-- Name: hotSwappableUsers hotSwappableUsers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."hotSwappableUsers"
    ADD CONSTRAINT "hotSwappableUsers_pkey" PRIMARY KEY (id);


--
-- Name: hotSwappableUsers hotswappableusers_fromuserid_touserid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."hotSwappableUsers"
    ADD CONSTRAINT hotswappableusers_fromuserid_touserid_unique UNIQUE ("fromUserId", "toUserId");


--
-- Name: integration integration_name_roadmapid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_name_roadmapid_unique UNIQUE (name, "roadmapId");


--
-- Name: integration integration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_pkey PRIMARY KEY (id);


--
-- Name: invitationRepresentative invitationRepresentative_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."invitationRepresentative"
    ADD CONSTRAINT "invitationRepresentative_pkey" PRIMARY KEY ("invitationId", "customerId");


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_roadmapid_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_roadmapid_email_unique UNIQUE ("roadmapId", email);


--
-- Name: jiraconfigurations jiraconfigurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jiraconfigurations
    ADD CONSTRAINT jiraconfigurations_pkey PRIMARY KEY (id);


--
-- Name: jiraconfigurations jiraconfigurations_roadmapid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jiraconfigurations
    ADD CONSTRAINT jiraconfigurations_roadmapid_unique UNIQUE ("roadmapId");


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: passwordResetToken passwordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."passwordResetToken"
    ADD CONSTRAINT "passwordResetToken_pkey" PRIMARY KEY ("userId");


--
-- Name: passwordResetToken passwordresettoken_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."passwordResetToken"
    ADD CONSTRAINT passwordresettoken_uuid_unique UNIQUE (uuid);


--
-- Name: roadmaps roadmaps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmaps
    ADD CONSTRAINT roadmaps_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY ("userId", "roadmapId");


--
-- Name: taskratings taskratings_parenttask_createdbyuser_forcustomer_dimension_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskratings
    ADD CONSTRAINT taskratings_parenttask_createdbyuser_forcustomer_dimension_uniq UNIQUE ("parentTask", "createdByUser", "forCustomer", dimension);


--
-- Name: taskratings taskratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskratings
    ADD CONSTRAINT taskratings_pkey PRIMARY KEY (id);


--
-- Name: taskrelation taskrelation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskrelation
    ADD CONSTRAINT taskrelation_pkey PRIMARY KEY ("from", "to", type);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_roadmapid_externalid_importedfrom_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_roadmapid_externalid_importedfrom_unique UNIQUE ("roadmapId", "externalId", "importedFrom");


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_user_type_provider_instance_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_user_type_provider_instance_unique UNIQUE ("user", type, provider, instance);


--
-- Name: importStatusMapping trelloColumnMappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."importStatusMapping"
    ADD CONSTRAINT "trelloColumnMappings_pkey" PRIMARY KEY (id);


--
-- Name: importStatusMapping trellocolumnmappings_integrationid_fromcolumn_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."importStatusMapping"
    ADD CONSTRAINT trellocolumnmappings_integrationid_fromcolumn_unique UNIQUE ("integrationId", "fromColumn");


--
-- Name: users users_authtoken_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_authtoken_unique UNIQUE ("authToken");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: versionTasks versionTasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."versionTasks"
    ADD CONSTRAINT "versionTasks_pkey" PRIMARY KEY ("versionId", "taskId");


--
-- Name: versions versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT versions_pkey PRIMARY KEY (id);


--
-- Name: versions versions_roadmapid_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT versions_roadmapid_id_unique UNIQUE ("roadmapId", id);


--
-- Name: versions versions_roadmapid_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT versions_roadmapid_name_unique UNIQUE ("roadmapId", name);


--
-- Name: emailverification_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emailverification_uuid_index ON public."emailVerification" USING btree (uuid);


--
-- Name: hotswappableusers_fromuserid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hotswappableusers_fromuserid_index ON public."hotSwappableUsers" USING btree ("fromUserId");


--
-- Name: integration_roadmapid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX integration_roadmapid_index ON public.integration USING btree ("roadmapId");


--
-- Name: invitations_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_id_index ON public.invitations USING btree (id);


--
-- Name: jiraconfigurations_roadmapid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jiraconfigurations_roadmapid_index ON public.jiraconfigurations USING btree ("roadmapId");


--
-- Name: lower_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX lower_email ON public.users USING btree (lower((email)::text));


--
-- Name: passwordresettoken_uuid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX passwordresettoken_uuid_index ON public."passwordResetToken" USING btree (uuid);


--
-- Name: roles_userid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_userid_index ON public.roles USING btree ("userId");


--
-- Name: taskratings_createdbyuser_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX taskratings_createdbyuser_index ON public.taskratings USING btree ("createdByUser");


--
-- Name: taskratings_parenttask_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX taskratings_parenttask_index ON public.taskratings USING btree ("parentTask");


--
-- Name: tasks_createdbyuser_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_createdbyuser_index ON public.tasks USING btree ("createdByUser");


--
-- Name: tasks_externalid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_externalid_index ON public.tasks USING btree ("externalId");


--
-- Name: tasks_roadmapid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_roadmapid_index ON public.tasks USING btree ("roadmapId");


--
-- Name: tokens_forintegration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tokens_forintegration_index ON public.tokens USING btree ("forIntegration");


--
-- Name: tokens_user_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tokens_user_index ON public.tokens USING btree ("user");


--
-- Name: trellocolumnmappings_integrationid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trellocolumnmappings_integrationid_index ON public."importStatusMapping" USING btree ("integrationId");


--
-- Name: unique_developer_ratings; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_developer_ratings ON public.taskratings USING btree ("parentTask", "createdByUser", dimension) WHERE ("forCustomer" IS NULL);


--
-- Name: users_defaultroadmapid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_defaultroadmapid_index ON public.users USING btree ("defaultRoadmapId");


--
-- Name: versions_roadmapid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX versions_roadmapid_index ON public.versions USING btree ("roadmapId");


--
-- Name: versions_sortingrank_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX versions_sortingrank_index ON public.versions USING btree ("sortingRank");


--
-- Name: versiontasks_taskid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX versiontasks_taskid_index ON public."versionTasks" USING btree ("taskId");


--
-- Name: versiontasks_versionid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX versiontasks_versionid_index ON public."versionTasks" USING btree ("versionId");


--
-- Name: customer customer_roadmapid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_roadmapid_foreign FOREIGN KEY ("roadmapId") REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: customerRepresentative customerrepresentative_customerid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."customerRepresentative"
    ADD CONSTRAINT customerrepresentative_customerid_foreign FOREIGN KEY ("customerId") REFERENCES public.customer(id) ON DELETE CASCADE;


--
-- Name: customerRepresentative customerrepresentative_userid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."customerRepresentative"
    ADD CONSTRAINT customerrepresentative_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: emailVerification emailverification_userid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."emailVerification"
    ADD CONSTRAINT emailverification_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: hotSwappableUsers hotswappableusers_fromuserid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."hotSwappableUsers"
    ADD CONSTRAINT hotswappableusers_fromuserid_foreign FOREIGN KEY ("fromUserId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: hotSwappableUsers hotswappableusers_touserid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."hotSwappableUsers"
    ADD CONSTRAINT hotswappableusers_touserid_foreign FOREIGN KEY ("toUserId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: integration integration_roadmapid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_roadmapid_foreign FOREIGN KEY ("roadmapId") REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: invitationRepresentative invitationrepresentative_customerid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."invitationRepresentative"
    ADD CONSTRAINT invitationrepresentative_customerid_foreign FOREIGN KEY ("customerId") REFERENCES public.customer(id) ON DELETE CASCADE;


--
-- Name: invitationRepresentative invitationrepresentative_invitationid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."invitationRepresentative"
    ADD CONSTRAINT invitationrepresentative_invitationid_foreign FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON DELETE CASCADE;


--
-- Name: invitations invitations_roadmapid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_roadmapid_foreign FOREIGN KEY ("roadmapId") REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: jiraconfigurations jiraconfigurations_roadmapid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jiraconfigurations
    ADD CONSTRAINT jiraconfigurations_roadmapid_foreign FOREIGN KEY ("roadmapId") REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: passwordResetToken passwordresettoken_userid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."passwordResetToken"
    ADD CONSTRAINT passwordresettoken_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: roles roles_roadmapid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_roadmapid_foreign FOREIGN KEY ("roadmapId") REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: roles roles_userid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_userid_foreign FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: taskratings taskratings_createdbyuser_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskratings
    ADD CONSTRAINT taskratings_createdbyuser_foreign FOREIGN KEY ("createdByUser") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: taskratings taskratings_forcustomer_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskratings
    ADD CONSTRAINT taskratings_forcustomer_foreign FOREIGN KEY ("forCustomer") REFERENCES public.customer(id) ON DELETE CASCADE;


--
-- Name: taskratings taskratings_parenttask_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskratings
    ADD CONSTRAINT taskratings_parenttask_foreign FOREIGN KEY ("parentTask") REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: taskrelation taskrelation_from_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskrelation
    ADD CONSTRAINT taskrelation_from_foreign FOREIGN KEY ("from") REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: taskrelation taskrelation_to_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taskrelation
    ADD CONSTRAINT taskrelation_to_foreign FOREIGN KEY ("to") REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_createdbyuser_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_createdbyuser_foreign FOREIGN KEY ("createdByUser") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_lastupdatedbyuserid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_lastupdatedbyuserid_foreign FOREIGN KEY ("lastUpdatedByUserId") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_roadmapid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_roadmapid_foreign FOREIGN KEY ("roadmapId") REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: tokens tokens_forintegration_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_forintegration_foreign FOREIGN KEY ("forIntegration") REFERENCES public.integration(id) ON DELETE CASCADE;


--
-- Name: tokens tokens_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_user_foreign FOREIGN KEY ("user") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: importStatusMapping trellocolumnmappings_integrationid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."importStatusMapping"
    ADD CONSTRAINT trellocolumnmappings_integrationid_foreign FOREIGN KEY ("integrationId") REFERENCES public.integration(id) ON DELETE CASCADE;


--
-- Name: users users_defaultroadmapid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_defaultroadmapid_foreign FOREIGN KEY ("defaultRoadmapId") REFERENCES public.roadmaps(id) ON DELETE SET NULL;


--
-- Name: versions versions_roadmapid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT versions_roadmapid_foreign FOREIGN KEY ("roadmapId") REFERENCES public.roadmaps(id) ON DELETE CASCADE;


--
-- Name: versionTasks versiontasks_taskid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."versionTasks"
    ADD CONSTRAINT versiontasks_taskid_foreign FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: versionTasks versiontasks_versionid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."versionTasks"
    ADD CONSTRAINT versiontasks_versionid_foreign FOREIGN KEY ("versionId") REFERENCES public.versions(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
