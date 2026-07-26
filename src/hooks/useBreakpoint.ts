import { useWindowDimensions } from 'react-native';

// Largura da janela decide LAYOUT (quantas colunas, tabs vs sidebar).
// Platform.OS decide CAPACIDADE (picker nativo, hover, atalho de teclado).
// São coisas diferentes: web roda no celular e tablet em paisagem é largo —
// por isso nada aqui olha para Platform.
export const BREAKPOINTS = {
  medio: 768,
  amplo: 1024,
} as const;

export type Breakpoint = {
  /** Celular, ou janela de navegador estreita. */
  compacto: boolean;
  /** Tablet retrato / janela média. */
  medio: boolean;
  /** Desktop — a partir daqui a navegação vira sidebar. */
  amplo: boolean;
  largura: number;
};

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();

  return {
    largura: width,
    compacto: width < BREAKPOINTS.medio,
    medio: width >= BREAKPOINTS.medio && width < BREAKPOINTS.amplo,
    amplo: width >= BREAKPOINTS.amplo,
  };
}
