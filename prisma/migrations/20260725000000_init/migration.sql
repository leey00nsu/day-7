CREATE TABLE "game_choice_responses" (
  "id" SERIAL NOT NULL,
  "player_id" UUID NOT NULL,
  "decision_id" TEXT NOT NULL,
  "choice_index" SMALLINT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "game_choice_responses_decision_id_check" CHECK (
    "decision_id" IN (
      'MONDAY_STATUS',
      'TUESDAY_OVERTIME',
      'WEDNESDAY_BLAME',
      'THURSDAY_CREDIT'
    )
  ),
  CONSTRAINT "game_choice_responses_choice_index_check" CHECK (
    "choice_index" IN (0, 1)
  ),
  CONSTRAINT "game_choice_responses_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX "game_choice_responses_player_decision_idx"
  ON "game_choice_responses" ("player_id", "decision_id");

CREATE INDEX "game_choice_responses_aggregate_idx"
  ON "game_choice_responses" ("decision_id", "choice_index");

CREATE TABLE "game_ending_responses" (
  "id" SERIAL NOT NULL,
  "player_id" UUID NOT NULL,
  "ending_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "game_ending_responses_ending_id_check" CHECK (
    "ending_id" IN ('E01', 'E02', 'E03')
  ),
  CONSTRAINT "game_ending_responses_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX "game_ending_responses_player_ending_idx"
  ON "game_ending_responses" ("player_id", "ending_id");

CREATE INDEX "game_ending_responses_aggregate_idx"
  ON "game_ending_responses" ("ending_id");
