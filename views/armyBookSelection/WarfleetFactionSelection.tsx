import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, store } from "../../data/store";
import { useRouter } from "next/router";
import _ from "lodash";
import { ArmyBookList } from "./ArmyBookList";
import { getFtlBooks, IFtlData, selectFtlFaction } from "../../data/ftlSlice";

export default function WarfleetFactionSelection({ searchText }) {
  const armyData = useSelector((state: RootState) => state.army);
  const ftlState = useSelector((state: RootState) => state.ftl);
  const dispatch = useDispatch<typeof store.dispatch>();
  const router = useRouter();

  const appendMode = !!router.query["append"];

  const search = (factions: IFtlData[]) =>
    factions?.filter((a) => a.faction.toLowerCase().includes(searchText.toLowerCase()));

  const allFactions = ftlState.factionData ?? [];
  const factions = search(allFactions);

  useEffect(() => {
    async function loadFtlData() {
      // Redirect to game selection screen if no army selected
      if (!armyData.gameSystem) {
        router.push({ pathname: "gameSystem/", query: router.query }, null, {
          shallow: true,
        });
        return;
      }

      if (!appendMode) {
        //dispatch(resetLoadedBooks());
        // Clear any existing units?
        //dispatch(resetList());
      }

      dispatch(getFtlBooks());
    }

    loadFtlData();
  }, [armyData.gameSystem]);

  function selectFaction(faction: IFtlData) {
    dispatch(selectFtlFaction(faction));

    router.push({
      pathname: "/listConfiguration",
      query: { ...router.query },
    });
  }

  return (
    <>
      <div className="mb-4 has-text-centered is-clearfix">
        <h3 className="is-size-4 pt-4">Choose {appendMode ? "another" : "an"} Army Book</h3>
      </div>
      <ArmyBookList
        armyBooks={factions
          .filter((x) => x.key !== "common")
          .map((x) => ({ ...x, name: x.faction }))}
        onSelect={selectFaction}
      />
    </>
  );
}
