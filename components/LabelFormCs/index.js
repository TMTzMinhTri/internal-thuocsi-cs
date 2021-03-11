import React, { memo } from 'react';
import { FormLabel } from '@material-ui/core';

const LabelFormCs = (props) => {
  const { children } = props;
  return (
    <FormLabel {...props} component="legend" style={{ fontWeight: 'bold', color: 'black' }}>
      {children}
    </FormLabel>
  );
};

export default memo(LabelFormCs);
