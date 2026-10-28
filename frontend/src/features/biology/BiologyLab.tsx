/** Biology landing page for Class 9: the four World of Living chapters, read from the curriculum registry. */

import React from 'react';
import { SubjectChaptersPage } from '../education/SubjectChaptersPage';

export const BiologyLab: React.FC = () => (
  <SubjectChaptersPage subject="biology" testId="biology-hub" title="Biology"
    intro="Class 9 Biology follows NCERT Exploration (2026-27), Unit I World of Living: the cell, tissues, reproduction, and diversity and classification. Each chapter has lessons, a laboratory with a virtual microscope, practice and an assessment." />
);
