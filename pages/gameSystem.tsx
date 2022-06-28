import { useDispatch } from "react-redux";
import { setGameSystem } from "../data/armySlice";
import { useRouter } from "next/router";
import { Paper } from "@mui/material";
import { useEffect } from "react";
import NotificationBanner from "../views/components/NotificationBanner";
import { MenuBar } from "../views/components/MenuBar";

function selectGameSystem(dispatch, router, gameSystem: string) {
  dispatch(setGameSystem(gameSystem));
  router?.push({
    pathname: "/armyBookSelection",
    query: { ...router.query, gameSystem: gameSystem },
  });
}

export default function GameSystem() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (router.query) {
      console.log(router.query);
      const gameSystem = router.query.gameSystem as string;
      if (gameSystems.includes(gameSystem))
        selectGameSystem(dispatch, router, gameSystem);
    }
  }, []);

  const gameSystems = ["gf", "gff", "aof", "aofs", "aofr", "ftl"];

  return (
    <>
      <NotificationBanner />
      <MenuBar title="Create a new list" onBackClick={() => router.push("/")} />
      <div className="container">
        <div className="mx-auto p-4" style={{ maxWidth: "480px" }}>
          <h3 className="is-size-4 has-text-centered mb-4">
            Select Game System
          </h3>
          <div className="columns is-multiline is-mobile">
            {gameSystems.map((gameSystem) => (
              <GameSystemTile key={gameSystem} gameSystem={gameSystem} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function GameSystemTile({ gameSystem }) {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div className="column is-half">
      <Paper>
        <img
          onClick={() => selectGameSystem(dispatch, router, gameSystem)}
          src={`img/${gameSystem}_cover.jpg`}
          className={"game-system-tile interactable"}
          style={{
            borderRadius: "4px",
            display: "block",
          }}
        />
      </Paper>
    </div>
  );
}
