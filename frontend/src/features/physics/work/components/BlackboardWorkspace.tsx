import React from 'react';
import type { WorkResult } from '../../../../engine/physics/work/workModel';
import { GlobalBlackboard } from '../../../workspace';

export interface BlackboardWorkspaceProps {
  onReturnToExperiment: () => void;
  result?: WorkResult;
}

export const BlackboardWorkspace: React.FC<BlackboardWorkspaceProps> = ({
  onReturnToExperiment,
}) => {
  return (
    <GlobalBlackboard
      namespace="physics-work"
      onReturnToExperiment={onReturnToExperiment}
    />
  );
};
