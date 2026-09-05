import { asyncHandler } from "../utils/asyncHandler.js";
import { addBodyMeasurement, listBodyMeasurements } from "../services/bodyMeasurementService.js";

export const postMeasurement = asyncHandler(async (req, res) => {
  const measurement = await addBodyMeasurement(req.user.sub, req.body);
  res.status(201).json({ measurement });
});

export const getMeasurements = asyncHandler(async (req, res) => {
  const measurements = await listBodyMeasurements(req.user.sub);
  res.status(200).json({ measurements });
});
