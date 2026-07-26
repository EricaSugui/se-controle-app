import { useState } from 'react';

// `hovered` não existe em PressableStateCallbackType nos tipos do RN, então
// hover se faz com onHoverIn/onHoverOut e estado local. No mobile esses
// eventos nunca disparam — o hook fica inerte, sem custo.
export function useHover() {
  const [hover, setHover] = useState(false);

  return {
    hover,
    hoverProps: {
      onHoverIn: () => setHover(true),
      onHoverOut: () => setHover(false),
    },
  };
}
