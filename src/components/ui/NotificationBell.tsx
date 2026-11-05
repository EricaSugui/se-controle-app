import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { aceitarConviteRecebido, getConvitesRecebidos, type ConviteRecebido } from '@/src/services/api/convite';
import { cores, raio } from '@/src/theme/tokens';
import { notificar } from '@/src/utils/confirmar';

export function NotificationBell() {
  const [convites, setConvites] = useState<ConviteRecebido[]>([]);
  const [visivel, setVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [aceitando, setAceitando] = useState<number | null>(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    getConvitesRecebidos()
      .then(setConvites)
      .catch(() => setConvites([]))
      .finally(() => setCarregando(false));
  }, []);

  useFocusEffect(carregar);

  async function aceitar(id: number) {
    setAceitando(id);
    try {
      await aceitarConviteRecebido(id);
      setConvites((atuais) => atuais.filter((convite) => convite.id !== id));
      notificar('Convite aceito', 'Agora você participa desta casa.');
      router.replace('/(app)/dashboard');
    } catch (e: unknown) {
      notificar('Erro', e instanceof Error ? e.message : 'Não foi possível aceitar o convite.');
    } finally {
      setAceitando(null);
    }
  }

  return (
    <>
      <Pressable
        accessibilityLabel={convites.length > 0 ? `${convites.length} convite(s) pendente(s)` : 'Notificações'}
        onPress={() => setVisivel(true)}
        style={styles.botao}
      >
        <Ionicons name="notifications-outline" size={22} color={cores.textoForte} />
        {convites.length > 0 && (
          <View style={styles.badge}><Text style={styles.badgeTexto}>{convites.length}</Text></View>
        )}
      </Pressable>

      <Modal visible={visivel} transparent animationType="fade" onRequestClose={() => setVisivel(false)}>
        <Pressable style={styles.fundo} onPress={() => setVisivel(false)}>
          <Pressable style={styles.painel} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.titulo}>Notificações</Text>
            {carregando ? <ActivityIndicator /> : convites.length === 0 ? (
              <Text style={styles.vazio}>Nenhum convite pendente.</Text>
            ) : (
              <FlatList
                data={convites}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <View style={styles.convite}>
                    <Text style={styles.texto}>
                      {item.convidado_por_nome} convidou você para participar de {item.casa_nome ?? 'uma casa'}.
                    </Text>
                    <Pressable
                      style={styles.aceitar}
                      disabled={aceitando === item.id}
                      onPress={() => aceitar(item.id)}
                    >
                      {aceitando === item.id
                        ? <ActivityIndicator color={cores.textoInverso} />
                        : <Text style={styles.aceitarTexto}>Aceitar convite</Text>}
                    </Pressable>
                  </View>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botao: { marginRight: 12, padding: 4 },
  badge: { position: 'absolute', right: 0, top: -2, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: cores.negativo, alignItems: 'center', justifyContent: 'center' },
  badgeTexto: { color: cores.textoInverso, fontSize: 10, fontWeight: '700' },
  fundo: { flex: 1, backgroundColor: cores.overlay, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingHorizontal: 12 },
  painel: { width: 320, maxWidth: '100%', backgroundColor: cores.fundo, borderRadius: raio.md, padding: 16, gap: 12, maxHeight: 420 },
  titulo: { color: cores.textoForte, fontSize: 18, fontWeight: '700' },
  vazio: { color: cores.textoMedio, paddingVertical: 12 },
  convite: { borderTopWidth: 1, borderTopColor: cores.bordaSuave, gap: 10, paddingVertical: 12 },
  texto: { color: cores.textoForte, fontSize: 14, lineHeight: 20 },
  aceitar: { backgroundColor: cores.primaria, borderRadius: raio.md, padding: 10, alignItems: 'center' },
  aceitarTexto: { color: cores.textoInverso, fontWeight: '600' },
});
