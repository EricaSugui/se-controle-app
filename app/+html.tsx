import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { cores, raio } from '@/src/theme/tokens';

// Shell HTML do web. Sem este arquivo o expo-router usa um default que
// serve `lang="en"` num app todo em português.
//
// O <title> NÃO mora aqui: o expo-router renderiza um <title data-rh> do
// react-helmet antes de qualquer coisa que este head declare, e com dois
// <title> o browser usa o primeiro. O título vem do <Head> no layout raiz.

// O RNW já dá tabIndex=0 a todo Pressable e não reseta `outline`, então o
// foco de teclado sempre funcionou; o que faltava era um anel desenhado no
// lugar do padrão de cada browser. `:focus-visible` só dispara em navegação
// por teclado — clique de mouse continua sem anel.
const estilos = `
:focus-visible {
  outline: 2px solid ${cores.primaria};
  outline-offset: 2px;
  border-radius: ${raio.md}px;
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Parity com native para o ScrollView raiz — vem do expo-router. */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: estilos }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
