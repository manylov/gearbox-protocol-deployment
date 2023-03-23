import { DEPLOYMENT_SETTINGS } from "../deployment-settings";

export const getPoolSettings = () => {
  const pool = process.argv[4];
  const deploySettings = DEPLOYMENT_SETTINGS[pool];
  if (!deploySettings)
    throw new Error(
      `Pool with id ${pool} is not found in deployment-settings.ts`
    );

  return deploySettings;
};
