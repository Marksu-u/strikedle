"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import GameActions, { type GameActionItem } from "@/components/GameActions";
import HelpModal from "@/components/HelpModal";
import CategorySelect from "@/components/more-or-lessr/CategorySelect";
import ChainBoard from "@/components/more-or-lessr/ChainBoard";
import ResultBanner from "@/components/more-or-lessr/ResultBanner";
import { molPoints } from "@/lib/daily/scoring";
import { useTranslations } from "next-intl";
import { useDailyPuzzle, useDay } from "@/lib/daily/useDailyPuzzle";
import type { PuzzleId } from "@/lib/daily/types";
import type { GameState, MorelessData } from "@/lib/more-or-lessr/types";
import { createInitialState, createMorelessReducer } from "./reducer";
import { SETTLE_MS } from "@/lib/more-or-lessr/timing";

export default function MorelessGame({ data }: { data: MorelessData }) {
  const t = useTranslations("moreOrLessr");
  const menu = useTranslations("menu");
  const game = useTranslations("game");
  const day = useDay();
  // Memoised reducer: closes over `data` + the day (freezes today's puzzle for the session).
  const reducer = useMemo(() => createMorelessReducer(data, day), [data, day]);
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState(day),
  );

  // The chosen category determines which daily puzzle this is.
  const puzzleId = (
    state.category ? `mol-${state.category}` : "mol-wins"
  ) as PuzzleId;
  // The hook settles the resume PER category: switching from "wins" to "prize"
  // must restore the prize run, not start it over.
  const restaurer = useCallback(
    (s: GameState) => dispatch({ type: "RESTORE", state: s }),
    [],
  );
  const { done, points, commit } = useDailyPuzzle<GameState>({
    id: puzzleId,
    day,
    state,
    onRestore: restaurer,
    savable:
      state.mode === "daily" &&
      (state.status === "playing" || state.status === "revealed"),
  });

  // Whether to count the score up or simply print it.
  //
  // `done` is what STORAGE says, and the commit that sets it runs in an effect
  // AFTER the render that ends the puzzle. So a live finish is "finished here,
  // not yet finished there", while a reload is finished in both — which is the
  // whole difference between a result worth animating and one being read back.
  const fresh = state.status === "finished" && !done;

  useEffect(() => {
    if (state.mode !== "daily" || state.status !== "finished" || done) return;
    commit({ status: "won", points: molPoints(state.score), state });
  }, [state, done, commit]);

  const [helpOpen, setHelpOpen] = useState(false);

  // The chain advances on the ANIMATION, not on a clock. ChainBoard reports
  // when every revealed number has reached its target; only then does the
  // finished face-off start its short settle. A delay measured from the click
  // instead raced the count-up and truncated it.
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (!landed) return;
    const id = setTimeout(() => {
      setLanded(false);
      dispatch({ type: "NEXT" });
    }, SETTLE_MS);
    return () => clearTimeout(id);
  }, [landed]);

  // Pas d'indice pour ce jeu : le menu ne propose que l'aide et l'abandon.
  const actions: GameActionItem[] = [
    {
      id: "help",
      label: menu("help"),
      icon: "help",
      onSelect: () => setHelpOpen(true),
    },
    {
      id: "give-up",
      label: menu("giveUp"),
      icon: "giveup",
      disabled: state.status === "select" || state.status === "finished",
      onSelect: () => dispatch({ type: "GIVE_UP" }),
    },
  ];

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <GameActions items={actions} />

      {state.status === "select" && (
        <CategorySelect
          onSelect={(category) => dispatch({ type: "START", category })}
        />
      )}

      {state.status === "finished" && (
        <ResultBanner
          fresh={fresh}
          score={state.score}
          points={points}
          results={state.results}
          // "finished" is only reachable through a started category.
          category={state.category!}
          day={state.day}
          practice={state.mode === "practice"}
          onReplay={() => dispatch({ type: "PRACTICE" })}
          onChangeCategory={() =>
            dispatch({
              type: "START",
              category: state.category === "wins" ? "prize" : "wins",
            })
          }
        />
      )}

      {/* playing | revealed : anchor & challenger sont garantis non-nuls. */}
      {(state.status === "playing" || state.status === "revealed") && (
        <ChainBoard
          anchor={state.anchor!}
          challenger={state.challenger!}
          category={state.category!}
          round={state.round}
          score={state.score}
          revealed={state.status === "revealed"}
          // Same signal that lets the chain move on: nothing may pass judgement
          // on the round until the numbers have finished climbing.
          settled={landed}
          lastGuess={state.lastGuess}
          lastCorrect={state.lastCorrect}
          onGuess={(direction) => dispatch({ type: "GUESS", direction })}
          onRevealComplete={() => setLanded(true)}
        />
      )}

      <HelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={game("howToPlay")}
      >
        <ul className="list-disc space-y-2 pl-4">
          {(t.raw("help.items") as string[]).map((_, i) => (
            <li key={i}>{t(`help.items.${i}`)}</li>
          ))}
        </ul>
      </HelpModal>
    </div>
  );
}
