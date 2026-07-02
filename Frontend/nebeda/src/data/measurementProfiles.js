const measurementProfiles = {
  Female: [
    {
      title: 'Upper Body',
      fields: ['Shoulder', 'Bust', 'Round Under Bust', 'Shoulder to Bust Point', 'Shoulder to Under Bust', 'Nipple to Nipple', 'Sleeve Length', 'Round Arm'],
    },
    { title: 'Waist & Hip', fields: ['Waist', 'Hip'] },
    { title: 'Dress Length', fields: ['Half Length', 'Full Length', 'From Belly Button to Down'] },
  ],
  Male: [
    { title: 'Upper Body', fields: ['Shoulder', 'Chest', 'Neck', 'Sleeve Length', 'Round Arm', 'Wrist', 'Top Length'] },
    { title: 'Waist & Hip', fields: ['Waist', 'Hip'] },
    { title: 'Lower Body', fields: ['Trouser Waist', 'Thigh', 'Knee', 'Calf', 'Ankle', 'Trouser Length'] },
  ],
}

const legacyMeasurementLabels = {
  chestBust: 'Chest / Bust',
  waist: 'Waist',
  hip: 'Hip',
  shoulder: 'Shoulder',
  sleeveLength: 'Sleeve Length',
  topLength: 'Top Length',
  trouserSkirtLength: 'Trouser / Skirt Length',
  height: 'Height',
}

function getMeasurementFields(gender) {
  return (measurementProfiles[gender] || []).flatMap((group) => group.fields)
}

function normalizeMeasurements(measurements, fallbackGender = '') {
  if (!measurements || typeof measurements !== 'object') {
    return { gender: fallbackGender, unit: 'cm', fields: [] }
  }

  if (Array.isArray(measurements.fields)) {
    return {
      gender: measurements.gender || fallbackGender,
      unit: measurements.unit || 'cm',
      fields: measurements.fields.filter(
        (field) => field?.name && field.value !== '' && field.value !== null && field.value !== undefined,
      ),
    }
  }

  return {
    gender: fallbackGender,
    unit: 'cm',
    fields: Object.entries(measurements)
      .filter(([name, value]) => name !== 'additionalNotes' && legacyMeasurementLabels[name] && value)
      .map(([name, value]) => ({ name: legacyMeasurementLabels[name], value })),
  }
}

export { getMeasurementFields, measurementProfiles, normalizeMeasurements }
