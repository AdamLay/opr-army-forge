import { IconButton, Menu } from "@mui/material";
import React, { useState } from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';

export function DropMenu({children}) {
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const close = (e) => {
        setOpen(false)
        setAnchorEl(null)
        e.stopPropagation()
    }
    return(
      <>
      <IconButton
          onClick={(e) => {setOpen(!open); setAnchorEl(e.target); e.stopPropagation()}}
        >
        <MoreVertIcon />
      </IconButton>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={close}
        onClick={close}
        children={children}
      />
      </>
    )
  }