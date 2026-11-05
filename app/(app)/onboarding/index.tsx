import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/src/components/ui/Button';
import { useOnboarding } from '@/src/context/OnboardingContext';
import { cores, raio } from '@/src/theme/tokens';
import type { OnboardingPerfil } from '@/src/types';

const PERFIS: { valor: OnboardingPerfil; titulo: string; texto: string }[] = [
  { valor: 'individual', titulo: 'Minha vida financeira', texto: 'Quero controlar minhas próprias despesas.' },
  { valor: 'responsavel', titulo: 'Uma casa compartilhada', texto: 'Quero organizar as despesas com outras pessoas.' },
  { valor: 'convidado', titulo: 'Entrei por convite', texto: 'Já fui convidado para participar de uma casa.' },
];

export default function OnboardingScreen() {
  const { onboarding, loading, atualizar, concluir, dispensar } = useOnboarding();
  const [perfil, setPerfil] = useState<OnboardingPerfil | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setPerfil(onboarding?.perfil ?? null);
  }, [onboarding?.perfil]);

  if (loading || onboarding == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  async function escolherPerfil(valor: OnboardingPerfil) {
    setSalvando(true);
    try {
      setPerfil(valor);
      await atualizar({ perfil: valor, etapa_atual: 'casa' });
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    await dispensar();
    router.replace('/(app)/dashboard');
  }

  async function finalizar() {
    await concluir();
    router.replace('/(app)/dashboard');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Vamos começar</Text>
      <Text style={styles.introducao}>
        Este guia é opcional e ajuda você a encontrar os próximos passos. Você pode sair e voltar depois.
      </Text>

      <Text style={styles.etapa}>1 de 3 — Como pretende usar?</Text>
      <View style={styles.lista}>
        {PERFIS.map((opcao) => (
          <Pressable
            key={opcao.valor}
            style={[styles.opcao, perfil === opcao.valor && styles.opcaoAtiva]}
            onPress={() => escolherPerfil(opcao.valor)}
            disabled={salvando}
          >
            <Text style={[styles.opcaoTitulo, perfil === opcao.valor && styles.opcaoTituloAtivo]}>
              {opcao.titulo}
            </Text>
            <Text style={styles.opcaoTexto}>{opcao.texto}</Text>
          </Pressable>
        ))}
      </View>

      {perfil != null && (
        <View style={styles.proxima}>
          <Text style={styles.etapa}>2 de 3 — Configure sua casa</Text>
          {perfil === 'convidado' ? (
            <>
              <Text style={styles.texto}>
                Consulte o dashboard da casa da qual você participa e registre seu primeiro gasto quando estiver pronto.
              </Text>
              <Button label="Ir para o dashboard" onPress={finalizar} />
            </>
          ) : (
            <>
              <Text style={styles.texto}>
                Crie uma casa para começar. Depois você poderá convidar pessoas e configurar contas, cartões e custeio.
              </Text>
              <Button
                label="Criar uma casa"
                onPress={() => {
                  void atualizar({ etapa_atual: 'essencial' });
                  router.push('/(app)/mais/casas/nova');
                }}
              />
            </>
          )}
        </View>
      )}

      <Button label="Pular por enquanto" variant="outline" onPress={sair} />
      <Button label="Concluir primeiros passos" variant="ghost" onPress={finalizar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container:          { gap: 16, padding: 24 },
  titulo:             { color: cores.textoForte, fontSize: 28, fontWeight: '700' },
  introducao:         { color: cores.textoMedio, fontSize: 15, lineHeight: 22 },
  etapa:              { color: cores.textoForte, fontSize: 17, fontWeight: '600' },
  lista:              { gap: 10 },
  opcao:              { borderColor: cores.borda, borderRadius: raio.md, borderWidth: 1, gap: 4, padding: 16 },
  opcaoAtiva:         { backgroundColor: cores.primariaSuave, borderColor: cores.primaria },
  opcaoTitulo:        { color: cores.textoForte, fontSize: 16, fontWeight: '600' },
  opcaoTituloAtivo:   { color: cores.primaria },
  opcaoTexto:         { color: cores.textoMedio, fontSize: 14 },
  proxima:            { backgroundColor: cores.fundoSuave, borderRadius: raio.md, gap: 12, padding: 16 },
  texto:              { color: cores.textoMedio, fontSize: 14, lineHeight: 21 },
});
