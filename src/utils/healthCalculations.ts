// Health calculation utilities

export interface HealthStats {
  bmi: number;
  bmiCategory: string;
  tdee: number; // Total Daily Energy Expenditure
  bmr: number; // Basal Metabolic Rate
}

/**
 * Calculate BMI (Body Mass Index)
 * BMI = weight (kg) / height (m)^2
 */
export const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100; // Convert cm to meters
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

/**
 * Get BMI category based on BMI value
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi >= 18.5 && bmi < 25) return 'Normal';
  if (bmi >= 25 && bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Get BMI color based on category
 */
export const getBMIColor = (bmi: number): string => {
  if (bmi < 18.5) return '#FF9800'; // Orange
  if (bmi >= 18.5 && bmi < 25) return '#4CAF50'; // Green
  if (bmi >= 25 && bmi < 30) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 */
export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number => {
  if (!weight || !height || !age) return 0;

  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  const bmr = gender === 'male' ? baseBMR + 5 : baseBMR - 161;

  return Math.round(bmr);
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR * activity multiplier
 */
export const calculateTDEE = (
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    very_active: 1.9, // Very hard exercise & physical job
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
};

/**
 * Calculate calorie needs for weight loss/gain
 */
export const calculateCalorieGoal = (
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): number => {
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500); // 500 calorie deficit for ~0.5kg/week loss
    case 'gain':
      return Math.round(tdee + 300); // 300 calorie surplus for ~0.3kg/week gain
    default:
      return tdee;
  }
};

/**
 * Calculate ideal weight range based on height (using BMI 18.5-25)
 */
export const getIdealWeightRange = (height: number): { min: number; max: number } => {
  const heightInMeters = height / 100;
  const minWeight = Math.round(18.5 * heightInMeters * heightInMeters);
  const maxWeight = Math.round(25 * heightInMeters * heightInMeters);

  return { min: minWeight, max: maxWeight };
};

/**
 * Get all health stats for a user
 */
export const calculateHealthStats = (
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate'
): HealthStats => {
  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
  };
};
