import type { FC } from 'react';

type FxWarningProps = {
  currency: string;
  onManageFx: () => void;
};

export const FxWarning: FC<FxWarningProps> = ({ currency, onManageFx }) => (
  <div className="rowCard warn" style={{ marginTop: 8 }}>
    <div>
      <div className="title">FX rate missing for {currency}.</div>
      <div className="sub">
        We'll assume your CPM/CPC/CPL are already in {currency}. Set a rate to normalize math.
      </div>
    </div>
    <button className="secBtn" onClick={onManageFx}>
      Manage FX
    </button>
  </div>
);

export default FxWarning;

