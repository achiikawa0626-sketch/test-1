import type { AccountMode } from '../lib/accountMode';
import { useAppLanguage } from '../lib/appLanguage';
import { uiText } from '../lib/uiTranslations';

type AccountSwitchProps = {
  mode: AccountMode;
  onChange: (mode: AccountMode) => void;
};

export function AccountSwitch({ mode, onChange }: AccountSwitchProps) {
  const [language] = useAppLanguage();
  const text = uiText(language);

  return (
    <div className="account-switch" aria-label={text.accountAria}>
      <button
        className={mode === 'kid' ? 'account-switch__button active' : 'account-switch__button'}
        type="button"
        onClick={() => onChange('kid')}
      >
        {text.kidParent}
      </button>
      <button
        className={
          mode === 'grandparent' ? 'account-switch__button active' : 'account-switch__button'
        }
        type="button"
        onClick={() => onChange('grandparent')}
      >
        {text.profileGrandparent}
      </button>
    </div>
  );
}
