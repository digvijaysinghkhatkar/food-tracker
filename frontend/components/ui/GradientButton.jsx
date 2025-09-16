import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import darkTheme from '../../theme/darkTheme';
import { gradients } from '../../theme/darkTheme';

// Custom button with gradient
const GradientButton = ({ colors, start, end, ...props }) => {
  return (
    <LinearGradient
      colors={colors || gradients.button}
      start={start || { x: 0, y: 0 }}
      end={end || { x: 1, y: 0 }}
      style={{
        borderRadius: darkTheme.roundness,
        overflow: 'hidden',
      }}
      {...props}
    />
  );
};

export default GradientButton;
