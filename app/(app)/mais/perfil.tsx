import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { updatePessoa } from '@/src/services/api/pessoas';
import { useAuth } from '@/src/context/AuthContext';
import { notificar } from '@/src/utils/confirmar';

const FUSOS_BR = [
  { valor: 'America/Sao_Paulo', label: 'São Paulo (Brasília)' },
  { valor: 'America/Fortaleza', label: 'Fortaleza' },
  { valor: 'America/Belem', label: 'Belém' },
  { valor: 'America/Cuiaba', label: 'Cuiabá' },
  { valor: 'America/Manaus', label: 'Manaus' },
  { valor: 'America/Rio_Branco', label: 'Rio Branco' },
  { valor: 'America/Noronha', label: 'Fernando de Noronha' },
];

export default function PerfilScreen() {
  const { user, refreshUser } = useAuth();

  const [fusoSelecionado, setFusoSelecionado] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const fusoDispositivo = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    setFusoSelecionado(user?.fuso_horario ?? null);
  }, [user?.fuso_horario]);

  // O fuso do aparelho entra como opção extra quando não está na lista BR.
  const opcoes = FUSOS_BR.some((f) => f.valor === fusoDispositivo)
    ? FUSOS_BR
    : [...FUSOS_BR, { valor: fusoDispositivo, label: fusoDispositivo }];

  const alterado = fusoSelecionado != null && fusoSelecionado !== user?.fuso_horario;
  const podeSalvar = alterado && !salvando;

  async function salvar() {
    if (user == null || fusoSelecionado == null || !podeSalvar) return;

    setSalvando(true);
    try {
      // PUT é replace de nome/email — reenvia os valores atuais junto.
      await updatePessoa(Number(user.id), {
        nome: user.nome,
        email: user.email || null,
        fuso_horario: fusoSelecionado,
      });
      await refreshUser();
      notificar(
        'Fuso horário atualizado',
        'O novo fuso passa a valer nos status de despesas e receitas fixas.'
      );
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (user == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.valor}>{user.nome}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.valor}>{user.email || '—'}</Text>
      </View>

      <Text style={styles.secao}>Fuso horário</Text>
      <Text style={styles.hint}>
        Usado para calcular o "hoje" nos status de despesas e receitas fixas.
        {'\n'}Detectado no aparelho: {fusoDispositivo}
        {fusoDispositivo === user.fuso_horario ? ' (já em uso)' : ''}
      </Text>

      <View style={styles.opcoesContainer}>
        {opcoes.map((f) => (
          <Pressable
            key={f.valor}
            style={[styles.opcao, fusoSelecionado === f.valor && styles.opcaoAtiva]}
            onPress={() => setFusoSelecionado(f.valor)}
          >
            <Text style={[styles.opcaoTexto, fusoSelecionado === f.valor && styles.opcaoTextoAtivo]}>
              {f.label}
              {f.valor === fusoDispositivo ? ' 📍' : ''}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.botao, !podeSalvar && styles.botaoDesabilitado]}
        onPress={salvar}
        disabled={!podeSalvar}
      >
        {salvando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botaoTexto}>Salvar</Text>
        }
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container:         { padding: 24, gap: 12 },

  card:              { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, gap: 2 },
  label:             { fontSize: 12, color: '#888', marginTop: 8 },
  valor:             { fontSize: 15, fontWeight: '500' },

  secao:             { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  hint:              { fontSize: 13, color: '#777' },

  opcoesContainer:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:        { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:        { fontSize: 14, color: '#555' },
  opcaoTextoAtivo:   { color: '#1565c0', fontWeight: '600' },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
