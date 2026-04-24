import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1714000000000 implements MigrationInterface {
  name = 'InitSchema1714000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_gender_enum" AS ENUM ('male', 'female', 'non_binary', 'other')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."users_subscriptiontier_enum" AS ENUM ('free', 'plus', 'gold')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "email"             VARCHAR       NOT NULL,
        "passwordHash"      VARCHAR,
        "name"              VARCHAR,
        "birthdate"         DATE,
        "gender"            "public"."users_gender_enum",
        "bio"               VARCHAR,
        "interests"         TEXT          NOT NULL DEFAULT '',
        "subscriptionTier"  "public"."users_subscriptiontier_enum" NOT NULL DEFAULT 'free',
        "coins"             INTEGER       NOT NULL DEFAULT 0,
        "streakDays"        INTEGER       NOT NULL DEFAULT 0,
        "lastActiveAt"      TIMESTAMP,
        "isVerified"        BOOLEAN       NOT NULL DEFAULT false,
        "isIncognito"       BOOLEAN       NOT NULL DEFAULT false,
        "isOnboarded"       BOOLEAN       NOT NULL DEFAULT false,
        "lat"               DOUBLE PRECISION,
        "lng"               DOUBLE PRECISION,
        "refreshTokenHash"  VARCHAR,
        "createdAt"         TIMESTAMP     NOT NULL DEFAULT now(),
        "updatedAt"         TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "photos" (
        "id"          UUID      NOT NULL DEFAULT gen_random_uuid(),
        "userId"      UUID      NOT NULL,
        "url"         VARCHAR   NOT NULL,
        "s3Key"       VARCHAR   NOT NULL,
        "isMain"      BOOLEAN   NOT NULL DEFAULT false,
        "isVerified"  BOOLEAN   NOT NULL DEFAULT false,
        "order"       INTEGER   NOT NULL DEFAULT 0,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_photos" PRIMARY KEY ("id"),
        CONSTRAINT "FK_photos_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "matches" (
        "id"        UUID      NOT NULL DEFAULT gen_random_uuid(),
        "user1Id"   UUID      NOT NULL,
        "user2Id"   UUID      NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_matches" PRIMARY KEY ("id"),
        CONSTRAINT "FK_matches_user1"
          FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_matches_user2"
          FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."messages_messagetype_enum"
        AS ENUM ('text', 'gift', 'date_invite', 'system')
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id"          UUID      NOT NULL DEFAULT gen_random_uuid(),
        "matchId"     UUID      NOT NULL,
        "senderId"    UUID      NOT NULL,
        "text"        VARCHAR,
        "messageType" "public"."messages_messagetype_enum" NOT NULL DEFAULT 'text',
        "metadata"    JSONB,
        "isRead"      BOOLEAN   NOT NULL DEFAULT false,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_match"
          FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_messages_sender"
          FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."swipes_direction_enum" AS ENUM ('right', 'left', 'super')
    `);

    await queryRunner.query(`
      CREATE TABLE "swipes" (
        "id"        UUID      NOT NULL DEFAULT gen_random_uuid(),
        "swiperId"  UUID      NOT NULL,
        "targetId"  UUID      NOT NULL,
        "direction" "public"."swipes_direction_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_swipes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_swipes_swiper_target" UNIQUE ("swiperId", "targetId"),
        CONSTRAINT "FK_swipes_swiper"
          FOREIGN KEY ("swiperId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_swipes_target"
          FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "reports" (
        "id"         UUID      NOT NULL DEFAULT gen_random_uuid(),
        "reporterId" UUID      NOT NULL,
        "targetId"   UUID      NOT NULL,
        "reason"     VARCHAR   NOT NULL,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reports_reporter"
          FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_target"
          FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "blocks" (
        "id"        UUID      NOT NULL DEFAULT gen_random_uuid(),
        "blockerId" UUID      NOT NULL,
        "blockedId" UUID      NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blocks" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blocks_blocker_blocked" UNIQUE ("blockerId", "blockedId"),
        CONSTRAINT "FK_blocks_blocker"
          FOREIGN KEY ("blockerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_blocks_blocked"
          FOREIGN KEY ("blockedId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_photos_userId"   ON "photos"   ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_matches_user1"   ON "matches"  ("user1Id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_matches_user2"   ON "matches"  ("user2Id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_match"  ON "messages" ("matchId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_sender" ON "messages" ("senderId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_swipes_swiper"   ON "swipes"   ("swiperId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_swipes_target"   ON "swipes"   ("targetId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blocks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "swipes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "matches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "photos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."swipes_direction_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."messages_messagetype_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_subscriptiontier_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_gender_enum"`);
  }
}
