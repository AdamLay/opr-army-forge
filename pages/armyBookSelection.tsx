import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import { useRouter } from "next/router";
import { IconButton, InputAdornment, Input } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import _ from "lodash";
import { MenuBar } from "../views/components/MenuBar";
import FactionSelection from "../views/armyBookSelection/FactionSelection";
import WarfleetFactionSelection from "../views/armyBookSelection/WarfleetFactionSelection";

export default function ArmyBookSelection() {
  const armyState = useSelector((state: RootState) => state.army);
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  return (
    <>
      <MenuBar
        title="Create a new list"
        onBackClick={() => router.push("/gameSystem")}
        right={<SearchBox searchText={searchText} setSearchText={setSearchText} />}
      />

      <div className="container">
        <div className="mx-auto p-4">
          {armyState.gameSystem === "ftl" ? (
            <WarfleetFactionSelection searchText={searchText} />
          ) : (
            <FactionSelection searchText={searchText} />
          )}
        </div>
      </div>
    </>
  );
}

function SearchBox({ searchText, setSearchText }) {
  return (
    <Input
      className="mt-1"
      sx={{
        flexBasis: "5em",
        flexGrow: 0.25,
        alignSelf: "center",
        color: "white",
        textAlign: "right",
      }}
      id="searchfield"
      size="small"
      margin="none"
      autoComplete="off"
      disableUnderline
      onChange={(e) => {
        setSearchText(e.target.value);
      }}
      value={searchText}
      inputProps={{ style: { textAlign: "right" } }}
      endAdornment={
        <InputAdornment position="end" sx={{ width: "2rem", color: "white" }}>
          {searchText ? (
            <IconButton
              size="small"
              onClick={() => {
                setSearchText(
                  ((document.getElementById("searchfield") as HTMLInputElement).value = "")
                );
              }}
            >
              <ClearIcon sx={{ color: "white" }} />
            </IconButton>
          ) : (
            <SearchIcon
              onClick={() => {
                document.getElementById("searchfield").focus();
              }}
            />
          )}
        </InputAdornment>
      }
    />
  );
}
