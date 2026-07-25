ALTER TABLE "game_choice_responses"
  ADD COLUMN "id" SERIAL NOT NULL;

ALTER TABLE "game_choice_responses"
  DROP CONSTRAINT "game_choice_responses_pkey";

ALTER TABLE "game_choice_responses"
  ADD CONSTRAINT "game_choice_responses_pkey" PRIMARY KEY ("id");

CREATE INDEX "game_choice_responses_player_decision_idx"
  ON "game_choice_responses" ("player_id", "decision_id");
