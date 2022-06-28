import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../data/store";
import { Fragment, useState } from "react";
import { Card, Divider, IconButton, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { IUnit } from "../data/interfaces";

import UnitService from "../services/UnitService";
import ArmyBookGroupHeader from "./components/ArmyBookGroupHeader";
import UnitListItem from "./components/UnitListItem";
import { addUnit, previewUnit, removeUnit, selectUnit } from "../data/listSlice";
import { useRouter } from "next/router";
import { IFtlData, IShipClass } from "../data/ftlSlice";
import _ from "lodash";

export function FtlShipSelection() {
  const ftl = useSelector((state: RootState) => state.ftl);
  const factions = [ftl.selectedFaction];

  return (
    <>
      {factions.map((faction) => (
        <FtlShipSelectionForFaction
          key={faction.key}
          faction={faction}
          showTitle={factions.length > 1}
        />
      ))}
    </>
  );
}

interface FtlShipSelectionForFactionProps {
  faction: IFtlData;
  showTitle: boolean;
}

function FtlShipSelectionForFaction({ faction, showTitle }: FtlShipSelectionForFactionProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const list = useSelector((state: RootState) => state.list);
  const [collapsed, setCollapsed] = useState(false);

  const handleAddClick = (unit: IShipClass) => {
    //dispatch(addUnit({ ...unit, armyId: army.uid }));
  };
  const handleSelectClick = (unit: IShipClass) => {
    //dispatch(previewUnit({ ...unit, armyId: army.uid } as any));
    router.push({ query: { ...router.query, upgradesOpen: true } });
  };

  const ships = faction.shipClasses;
  const shipGroups = _.groupBy(ships, (x) => x.type);

  return (
    <Card elevation={2} sx={{ backgroundColor: "#FAFAFA", marginBottom: "1rem" }} square>
      {showTitle && (
        <ArmyBookGroupHeader army={null} collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      {!collapsed &&
        Object.keys(shipGroups).map((key, i) => (
          <Fragment key={key}>
            {key !== "undefined" && shipGroups[key].length > 0 && (
              <p className={"menu-label my-2 px-4 " + (i > 0 ? "pt-3" : "")}>{key}</p>
            )}
            <Divider />
            {shipGroups[key].map((ship, index) => {
              const countInList = 1; //list?.units.filter(
              //   (listUnit) =>
              //     listUnit.name === u.name && listUnit.armyId === army.uid && !listUnit.joinToUnit
              // ).length;

              return (
                <ShipListItem
                  key={ship.key}
                  ship={ship}
                  countInList={countInList}
                  selected={countInList > 0 || list.unitPreview?.id === u.id}
                  onClick={() => {
                    handleSelectClick(ship);
                  }}
                  rightControl={
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddClick(ship);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  }
                />
              );
            })}
          </Fragment>
        ))}
    </Card>
  );
}

interface ShipListItemProps {
  ship: IShipClass;
  rightControl: JSX.Element;
  selected: boolean;
  onClick: () => void;
  countInList?: number;
}

function ShipListItem(props: ShipListItemProps) {
  const ship = props.ship;

  return (
    <>
      <Paper
        className="p-4"
        elevation={0}
        style={{
          backgroundColor: props.selected ? "#F9FDFF" : null,
          borderLeft: props.countInList > 0 ? "2px solid #0F71B4" : null,
          cursor: "pointer",
        }}
        square
        onClick={props.onClick}
      >
        <div className="is-flex is-flex-grow-1 is-align-items-center mb-2">
          <div className="is-flex-grow-1">
            <p className="mb-1">
              {props.countInList > 0 && (
                <span style={{ color: "#0F71B4" }}>{props.countInList}x </span>
              )}
              <span>{ship.label} </span>
              <span style={{ color: "#656565" }}>
                ({ship.type} {ship.upgradeSlotCount})
              </span>
            </p>

            <p style={{ fontSize: "14px" }}>
              Speed:
              <span style={{ color: "rgba(0,0,0,0.6)" }}>
                Move {ship.speed.move}" / Cruise {ship.speed.cruise}"
              </span>
            </p>
            <p style={{ fontSize: "14px" }}>
              Turret:
              <span style={{ color: "rgba(0,0,0,0.6)" }}>
                Range {ship.turret.range}" / Attack {ship.turret.attacks} / Strength{" "}
                {ship.turret.strength}
              </span>
            </p>
            <p style={{ fontSize: "14px" }}>
              Defense:
              <span style={{ color: "rgba(0,0,0,0.6)" }}>
                Evasion {ship.defense.evasion}+ / Tough {ship.defense.toughness}+
              </span>
            </p>
          </div>
          {/* <p>{UpgradeService.calculateUnitTotal(unit)}pts</p> */}
          {props.rightControl}
        </div>
        {/* <div style={{ fontSize: "14px", color: "rgba(0,0,0,0.6)" }}>
          <div>
            {Object.values(weaponGroups).map((group: any[], i) => {
              const count = group.reduce((c, next) => c + next.count, 0);
              return (
                <span key={i}>
                  {i > 0 ? ", " : ""}
                  {count > 1 ? `${count}x ` : ""}
                  {EquipmentService.formatString(group[0] as any)}
                </span>
              );
            })}
          </div>
          <RuleList
            specialRules={unit.specialRules.concat(UnitService.getAllUpgradedRules(unit as any))}
          />
        </div> */}
      </Paper>
      <Divider />
    </>
  );
}

function getShipCategories(ships: IShipClass[]) {
  return;
}
