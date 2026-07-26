import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

// Fonte única das abas de (app): o <Tabs> do layout e a Sidebar do desktop
// leem daqui para não divergirem em rótulo ou ordem.
export type Aba = {
  /** Precisa bater com o `name` do <Tabs.Screen>. */
  nome: string;
  /** Primeiro segmento de rota — usado para marcar o item ativo na sidebar. */
  segmento: string;
  titulo: string;
  href: Href;
  /** Só a sidebar usa; as tabs do mobile seguem sem ícone. */
  icone: React.ComponentProps<typeof Ionicons>['name'];
  /** A aba tem Stack próprio e desenha o próprio header. */
  headerProprio?: boolean;
};

export const ABAS: Aba[] = [
  { nome: 'dashboard/index', segmento: 'dashboard', titulo: 'Dashboard', href: '/(app)/dashboard', icone: 'home-outline' },
  { nome: 'gastos',          segmento: 'gastos',    titulo: 'Gastos',    href: '/(app)/gastos',    icone: 'cart-outline',        headerProprio: true },
  { nome: 'projecao/index',  segmento: 'projecao',  titulo: 'Projeção',  href: '/(app)/projecao',  icone: 'trending-up-outline' },
  { nome: 'metas',           segmento: 'metas',     titulo: 'Metas',     href: '/(app)/metas',     icone: 'flag-outline',        headerProprio: true },
  { nome: 'mais',            segmento: 'mais',      titulo: 'Mais',      href: '/(app)/mais',      icone: 'ellipsis-horizontal',  headerProprio: true },
];
