import { Card } from "@mui/material";
import ArmyImage from "../components/ArmyImage";
import _ from "lodash";
import { IArmyBookListItem } from "./ArmyBookList";

interface ArmyBookTileProps {
  army: IArmyBookListItem;// IArmyData;
  enabled: boolean;
  onSelect: (army: any) => void;
}

export default function ArmyBookTile({
  army,
  enabled,
  onSelect,
}: ArmyBookTileProps) {
  return (
    <div
      className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop"
      style={{ filter: enabled ? null : "saturate(0.25)" }}
    >
      <Card
        elevation={2}
        className={enabled ? "interactable" : null}
        onClick={() => (enabled ? onSelect(army) : null)}
      >
        <div className="mt-2 is-flex is-flex-direction-column is-flex-grow-1">
          <ArmyImage name={army.name} armyData={army} />
          <div className="is-flex is-flex-grow-1 is-align-items-center">
            <div className="is-flex-grow-1">
              <p
                className="my-2"
                style={{
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                {army.name}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
