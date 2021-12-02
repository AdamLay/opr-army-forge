import { Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { IUpgrade } from '../../data/interfaces';
import { RootState } from '../../data/store';
import UpgradeService from '../../services/UpgradeService';
import UpgradeItem from './UpgradeItem';

export default function UpgradeGroup({ upgrade }: { upgrade: IUpgrade }) {

  const list = useSelector((state: RootState) => state.list);

  const selectedUnit = list.selectedUnitId === null || list.selectedUnitId === undefined
    ? null
    : list.units.filter(u => u.selectionId === list.selectedUnitId)[0];

  const controlType = UpgradeService.getControlType(selectedUnit, upgrade);

  return (
    <Paper className="px-4 py-2" square elevation={0}>
      {
        // "None" / Default option for radio group
        controlType === "radio" && <UpgradeItem selectedUnit={selectedUnit} upgrade={upgrade} option={null} />
      }
      {upgrade.options.map((opt, i) => <UpgradeItem key={i} selectedUnit={selectedUnit} upgrade={upgrade} option={opt} />)}
    </Paper>
  );
}