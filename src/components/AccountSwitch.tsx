import type { AccountMode } from '../lib/accountMode';

type AccountSwitchProps = {
  mode: AccountMode;
  onChange: (mode: AccountMode) => void;
};

export function AccountSwitch({ mode, onChange }: AccountSwitchProps) {
  return (
    <div className="account-switch" aria-label="Choose account type">
      <button
        className={mode === 'kid' ? 'account-switch__button active' : 'account-switch__button'}
        type="button"
        onClick={() => onChange('kid')}
      >
        Child or parent
      </button>
      <button
        className={
          mode === 'grandparent' ? 'account-switch__button active' : 'account-switch__button'
        }
        type="button"
        onClick={() => onChange('grandparent')}
      >
        Grandma or granddad
      </button>
    </div>
  );
}
