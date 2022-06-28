import Head from "next/head";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../data/store";
import { useRouter } from "next/router";
import { useMediaQuery } from "react-responsive";
import MobileView from "../views/listBuilder/MobileView";
import DesktopView from "../views/listBuilder/DesktopView";
import { getGameRules } from "../data/armySlice";
import PersistenceService from "../services/PersistenceService";

export default function List() {
  const armyState = useSelector((state: RootState) => state.army);
  const ftlState = useSelector((state: RootState) => state.ftl);
  const router = useRouter();
  const dispatch = useDispatch();

  const loaded = armyState.loaded || ftlState.loaded;

  // Load army list file
  useEffect(() => {
    // Redirect to game selection screen if no army selected
    if (!loaded) {
      const listId = router.query["listId"] as string;
      if (listId) {
        PersistenceService.loadFromKey(dispatch, listId, (_) => {});
        return;
      }

      router.push({ pathname: "/gameSystem", query: router.query }, null, {
        shallow: true,
      });
      return;
    } else if (armyState.loaded) {
      dispatch(getGameRules(armyState.gameSystem));
    }
  }, []);

  // Break from mobile to desktop layout at 1024px wide
  const isBigScreen = useMediaQuery({ query: "(min-width: 1024px)" });

  return (
    <>
      <Head>
        <title>OPR Army Forge</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loaded ? isBigScreen ? <DesktopView /> : <MobileView /> : null}
    </>
  );
}
