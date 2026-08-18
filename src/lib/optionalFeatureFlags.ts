const featureKeyPrefix = 'askgrandma-optional-feature-ready';

export function isOptionalFeatureEnabled(featureName: string) {
  try {
    return localStorage.getItem(featureKey(featureName)) === 'yes';
  } catch {
    return false;
  }
}

export function enableOptionalFeature(featureName: string) {
  try {
    localStorage.setItem(featureKey(featureName), 'yes');
  } catch {
    // The feature can still work without remembering availability.
  }
}

export function disableOptionalFeature(featureName: string) {
  try {
    localStorage.removeItem(featureKey(featureName));
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

function featureKey(featureName: string) {
  return `${featureKeyPrefix}-${featureName}`;
}
