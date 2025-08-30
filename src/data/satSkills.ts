// Official SAT Skills Structure
// Based on the current SAT format domains and skills

export interface SATSkill {
  id: string;
  title: string;
  domain: string;
  section: 'math' | 'reading' | 'writing';
}

export interface SATDomain {
  id: string;
  title: string;
  section: 'math' | 'reading' | 'writing';
  skills: SATSkill[];
}

export const SAT_SKILLS_STRUCTURE = {
  math: {
    domains: [
      {
        id: 'algebra',
        title: 'Algebra',
        section: 'math' as const,
        skills: [
          { id: 'linear-equations-one-var', title: 'Linear equations in one variable', domain: 'Algebra', section: 'math' as const },
          { id: 'linear-functions', title: 'Linear functions', domain: 'Algebra', section: 'math' as const },
          { id: 'linear-equations-two-var', title: 'Linear equations in two variables', domain: 'Algebra', section: 'math' as const },
          { id: 'systems-linear-equations', title: 'Systems of two linear equations in two variables', domain: 'Algebra', section: 'math' as const },
          { id: 'linear-inequalities', title: 'Linear inequalities in one or two variables', domain: 'Algebra', section: 'math' as const }
        ]
      },
      {
        id: 'advanced-math',
        title: 'Advanced Math',
        section: 'math' as const,
        skills: [
          { id: 'nonlinear-functions', title: 'Nonlinear functions', domain: 'Advanced Math', section: 'math' as const },
          { id: 'nonlinear-equations', title: 'Nonlinear equations in one variable', domain: 'Advanced Math', section: 'math' as const },
          { id: 'systems-equations-two-var', title: 'Systems of equations in two variables', domain: 'Advanced Math', section: 'math' as const },
          { id: 'equivalent-expressions', title: 'Equivalent expressions', domain: 'Advanced Math', section: 'math' as const }
        ]
      },
      {
        id: 'problem-solving-data',
        title: 'Problem-Solving and Data Analysis',
        section: 'math' as const,
        skills: [
          { id: 'ratios-rates-proportions', title: 'Ratios, rates, proportional relationships, and units', domain: 'Problem-Solving and Data Analysis', section: 'math' as const },
          { id: 'percentages', title: 'Percentages', domain: 'Problem-Solving and Data Analysis', section: 'math' as const },
          { id: 'one-variable-data', title: 'One-variable data: Distributions and measures of center and spread', domain: 'Problem-Solving and Data Analysis', section: 'math' as const },
          { id: 'two-variable-data', title: 'Two-variable data: Models and scatterplots', domain: 'Problem-Solving and Data Analysis', section: 'math' as const },
          { id: 'probability-conditional', title: 'Probability and conditional probability', domain: 'Problem-Solving and Data Analysis', section: 'math' as const },
          { id: 'inference-statistics', title: 'Inference from sample statistics and margin of error', domain: 'Problem-Solving and Data Analysis', section: 'math' as const },
          { id: 'statistical-claims', title: 'Evaluating statistical claims: Observational studies and experiments', domain: 'Problem-Solving and Data Analysis', section: 'math' as const }
        ]
      },
      {
        id: 'geometry-trigonometry',
        title: 'Geometry and Trigonometry',
        section: 'math' as const,
        skills: [
          { id: 'area-volume', title: 'Area and volume', domain: 'Geometry and Trigonometry', section: 'math' as const },
          { id: 'lines-angles-triangles', title: 'Lines, angles, and triangles', domain: 'Geometry and Trigonometry', section: 'math' as const },
          { id: 'right-triangles-trig', title: 'Right triangles and trigonometry', domain: 'Geometry and Trigonometry', section: 'math' as const },
          { id: 'circles', title: 'Circles', domain: 'Geometry and Trigonometry', section: 'math' as const }
        ]
      }
    ]
  },
  reading: {
    domains: [
      {
        id: 'craft-structure',
        title: 'Craft and Structure',
        section: 'reading' as const,
        skills: [
          { id: 'words-in-context', title: 'Words in Context', domain: 'Craft and Structure', section: 'reading' as const },
          { id: 'text-structure-purpose', title: 'Text Structure and Purpose', domain: 'Craft and Structure', section: 'reading' as const },
          { id: 'cross-text-connections', title: 'Cross-Text Connections', domain: 'Craft and Structure', section: 'reading' as const }
        ]
      },
      {
        id: 'information-ideas',
        title: 'Information and Ideas',
        section: 'reading' as const,
        skills: [
          { id: 'central-ideas-details', title: 'Central Ideas and Details', domain: 'Information and Ideas', section: 'reading' as const },
          { id: 'inferences', title: 'Inferences', domain: 'Information and Ideas', section: 'reading' as const },
          { id: 'command-evidence', title: 'Command of Evidence', domain: 'Information and Ideas', section: 'reading' as const }
        ]
      }
    ]
  },
  writing: {
    domains: [
      {
        id: 'expression-ideas',
        title: 'Expression of Ideas',
        section: 'writing' as const,
        skills: [
          { id: 'rhetorical-synthesis', title: 'Rhetorical Synthesis', domain: 'Expression of Ideas', section: 'writing' as const },
          { id: 'transitions', title: 'Transitions', domain: 'Expression of Ideas', section: 'writing' as const }
        ]
      },
      {
        id: 'standard-english',
        title: 'Standard English Conventions',
        section: 'writing' as const,
        skills: [
          { id: 'boundaries', title: 'Boundaries', domain: 'Standard English Conventions', section: 'writing' as const },
          { id: 'form-structure-sense', title: 'Form, Structure, and Sense', domain: 'Standard English Conventions', section: 'writing' as const }
        ]
      }
    ]
  }
};

// Utility functions to work with the skills structure
export const getAllSkills = (): SATSkill[] => {
  const allSkills: SATSkill[] = [];
  
  Object.values(SAT_SKILLS_STRUCTURE).forEach(section => {
    section.domains.forEach(domain => {
      allSkills.push(...domain.skills);
    });
  });
  
  return allSkills;
};

export const getSkillsBySection = (section: 'math' | 'reading' | 'writing'): SATSkill[] => {
  return SAT_SKILLS_STRUCTURE[section].domains.flatMap(domain => domain.skills);
};

export const getSkillsByDomain = (domainId: string): SATSkill[] => {
  for (const section of Object.values(SAT_SKILLS_STRUCTURE)) {
    const domain = section.domains.find(d => d.id === domainId);
    if (domain) return domain.skills;
  }
  return [];
};

export const getSkillById = (skillId: string): SATSkill | undefined => {
  return getAllSkills().find(skill => skill.id === skillId);
};

export const getDomainById = (domainId: string): SATDomain | undefined => {
  for (const section of Object.values(SAT_SKILLS_STRUCTURE)) {
    const domain = section.domains.find(d => d.id === domainId);
    if (domain) return domain;
  }
  return undefined;
};

// Export for backward compatibility
export default SAT_SKILLS_STRUCTURE;