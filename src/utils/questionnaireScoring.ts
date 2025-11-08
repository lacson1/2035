/**
 * Questionnaire Scoring and Calculation Utilities
 * 
 * Provides scoring functions for standardized questionnaires
 */

export interface QuestionnaireScore {
  total: number;
  interpretation?: string;
  severity?: string;
  recommendations?: string[];
}

/**
 * Calculate PHQ-9 (Patient Health Questionnaire-9) score
 * Range: 0-27
 * Interpretation:
 * 0-4: Minimal depression
 * 5-9: Mild depression
 * 10-14: Moderate depression
 * 15-19: Moderately severe depression
 * 20-27: Severe depression
 */
export function calculatePHQ9(answers: Record<string, any>): QuestionnaireScore {
  const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
  let total = 0;
  
  questionIds.forEach(qId => {
    const value = answers[qId];
    if (typeof value === 'number') {
      total += value;
    }
  });
  
  let interpretation = '';
  let severity = '';
  const recommendations: string[] = [];
  
  if (total <= 4) {
    interpretation = 'Minimal or no depression';
    severity = 'Minimal';
  } else if (total <= 9) {
    interpretation = 'Mild depression';
    severity = 'Mild';
    recommendations.push('Consider watchful waiting, repeat PHQ-9 at follow-up');
  } else if (total <= 14) {
    interpretation = 'Moderate depression';
    severity = 'Moderate';
    recommendations.push('Consider treatment plan, counseling, or pharmacotherapy');
    recommendations.push('Follow-up in 2-4 weeks');
  } else if (total <= 19) {
    interpretation = 'Moderately severe depression';
    severity = 'Moderately Severe';
    recommendations.push('Active treatment with pharmacotherapy and/or psychotherapy');
    recommendations.push('Close monitoring and follow-up');
  } else {
    interpretation = 'Severe depression';
    severity = 'Severe';
    recommendations.push('Immediate treatment with pharmacotherapy and/or psychotherapy');
    recommendations.push('Consider psychiatric referral');
    recommendations.push('Assess for suicide risk');
  }
  
  return { total, interpretation, severity, recommendations };
}

/**
 * Calculate GAD-7 (Generalized Anxiety Disorder 7-item) score
 * Range: 0-21
 * Interpretation:
 * 0-4: Minimal anxiety
 * 5-9: Mild anxiety
 * 10-14: Moderate anxiety
 * 15-21: Severe anxiety
 */
export function calculateGAD7(answers: Record<string, any>): QuestionnaireScore {
  const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
  let total = 0;
  
  questionIds.forEach(qId => {
    const value = answers[qId];
    if (typeof value === 'number') {
      total += value;
    }
  });
  
  let interpretation = '';
  let severity = '';
  const recommendations: string[] = [];
  
  if (total <= 4) {
    interpretation = 'Minimal anxiety';
    severity = 'Minimal';
  } else if (total <= 9) {
    interpretation = 'Mild anxiety';
    severity = 'Mild';
    recommendations.push('Consider watchful waiting, repeat GAD-7 at follow-up');
  } else if (total <= 14) {
    interpretation = 'Moderate anxiety';
    severity = 'Moderate';
    recommendations.push('Consider treatment plan, counseling, or pharmacotherapy');
    recommendations.push('Follow-up in 2-4 weeks');
  } else {
    interpretation = 'Severe anxiety';
    severity = 'Severe';
    recommendations.push('Active treatment with pharmacotherapy and/or psychotherapy');
    recommendations.push('Consider psychiatric referral');
  }
  
  return { total, interpretation, severity, recommendations };
}

/**
 * Calculate cardiac risk score
 * Simple scoring based on risk factors
 */
export function calculateCardiacRisk(answers: Record<string, any>): QuestionnaireScore {
  let riskScore = 0;
  const riskFactors: string[] = [];
  
  if (answers.q1 === 'yes') {
    riskScore += 2;
    riskFactors.push('History of chest pain');
  }
  if (answers.q2 === 'yes') {
    riskScore += 2;
    riskFactors.push('Shortness of breath');
  }
  if (answers.q3 === 'yes') {
    riskScore += 1;
    riskFactors.push('Family history');
  }
  if (answers.q5 === 'yes') {
    riskScore += 3;
    riskFactors.push('Current smoker');
  } else if (answers.q5 === 'former') {
    riskScore += 1;
    riskFactors.push('Former smoker');
  }
  
  let interpretation = '';
  let severity = '';
  const recommendations: string[] = [];
  
  if (riskScore <= 2) {
    interpretation = 'Low cardiac risk';
    severity = 'Low';
    recommendations.push('Continue healthy lifestyle');
    recommendations.push('Regular check-ups');
  } else if (riskScore <= 4) {
    interpretation = 'Moderate cardiac risk';
    severity = 'Moderate';
    recommendations.push('Lifestyle modifications recommended');
    recommendations.push('Consider cardiac screening');
  } else {
    interpretation = 'High cardiac risk';
    severity = 'High';
    recommendations.push('Comprehensive cardiac evaluation recommended');
    recommendations.push('Consider stress testing');
    recommendations.push('Lifestyle modifications and possible medication');
  }
  
  return { total: riskScore, interpretation, severity, recommendations, ...{ riskFactors } };
}

/**
 * Calculate pain score (average of pain ratings)
 */
export function calculatePainScore(answers: Record<string, any>, questionIds: string[]): QuestionnaireScore {
  let total = 0;
  let count = 0;
  
  questionIds.forEach(qId => {
    const value = answers[qId];
    if (typeof value === 'number') {
      total += value;
      count++;
    }
  });
  
  const average = count > 0 ? total / count : 0;
  
  let interpretation = '';
  let severity = '';
  const recommendations: string[] = [];
  
  if (average <= 3) {
    interpretation = 'Mild pain';
    severity = 'Mild';
    recommendations.push('Consider conservative management');
  } else if (average <= 6) {
    interpretation = 'Moderate pain';
    severity = 'Moderate';
    recommendations.push('Consider pain management interventions');
    recommendations.push('Physical therapy may be beneficial');
  } else {
    interpretation = 'Severe pain';
    severity = 'Severe';
    recommendations.push('Immediate pain management needed');
    recommendations.push('Consider specialist referral');
  }
  
  return { total: Math.round(average * 10) / 10, interpretation, severity, recommendations };
}

/**
 * Generic calculator for questionnaires with numeric scores
 */
export function calculateTotalScore(
  answers: Record<string, any>,
  questionIds: string[],
  interpretationRanges?: { min: number; max: number; label: string }[]
): QuestionnaireScore {
  let total = 0;
  
  questionIds.forEach(qId => {
    const value = answers[qId];
    if (typeof value === 'number') {
      total += value;
    }
  });
  
  let interpretation = '';
  let severity = '';
  
  if (interpretationRanges) {
    const range = interpretationRanges.find(r => total >= r.min && total <= r.max);
    if (range) {
      interpretation = range.label;
      severity = range.label;
    }
  }
  
  return { total, interpretation, severity };
}

/**
 * Get scoring function for a questionnaire
 */
export function getScoringFunction(questionnaireId: string): ((answers: Record<string, any>) => QuestionnaireScore) | null {
  switch (questionnaireId) {
    case 'phq-9':
      return calculatePHQ9;
    case 'gad-7':
      return calculateGAD7;
    case 'cardiac-risk-assessment':
      return calculateCardiacRisk;
    case 'musculoskeletal-pain':
      return (answers) => calculatePainScore(answers, ['q2']);
    case 'headache-assessment':
      return (answers) => calculatePainScore(answers, ['q2']);
    default:
      return null;
  }
}

