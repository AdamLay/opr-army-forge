import { Checkbox } from '@mui/material';
import { useDispatch } from 'react-redux';
import { ISelectedUnit, IUpgrade, IUpgradeOption } from '../../../data/interfaces';
import { applyUpgrade, removeUpgrade } from '../../../data/listSlice';
import UpgradeService from '../../../services/UpgradeService';

export default function UpgradeCheckbox({ selectedUnit, upgrade, option }: { selectedUnit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption }) {

  const dispatch = useDispatch();

  const isApplied = (option) => UpgradeService.isApplied(selectedUnit, upgrade, option);
  const isValid = UpgradeService.isValid(selectedUnit, upgrade, option);

  const handleCheck = (option: IUpgradeOption) => {

    const applied = isApplied(option);

    if (!applied) {

      // Apply the selected upgrade
      dispatch(applyUpgrade({ unitId: selectedUnit.selectionId, upgrade, option }));

    } else {
      // Deselecting the already selected option in the group
      dispatch(removeUpgrade({ unitId: selectedUnit.selectionId, upgrade, option }));
    }
  };

  // #endregion

  return (
    <Checkbox
      checked={isApplied(option)}
      onClick={() => handleCheck(option)}
      value={option.label}
      disabled={!isValid}
       />
  );

  //return ({ upgrade.options.map((opt, i) => (<p></p>)});
}