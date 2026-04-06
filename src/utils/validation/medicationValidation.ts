import * as Yup from "yup";

export const medicationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Medication name is required"),
  dosage: Yup.string()
    .matches(/^\d+$/, "Dosage must be a number")
    .required("Dosage is required"),
  purpose: Yup.string(),
  instructions: Yup.string(),
});
