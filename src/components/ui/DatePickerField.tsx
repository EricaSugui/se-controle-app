import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { formatDate } from '@/src/utils/formatters';

type Props = {
  valor: string; // formato "AAAA-MM-DD" ou ''
  onSelecionar: (data: string) => void;
  placeholder?: string;
};

function paraData(valor: string): Date {
  if (!valor) return new Date();
  const [ano, mes, dia] = valor.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

function paraTexto(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function DatePickerField({ valor, onSelecionar, placeholder = 'Selecionar data' }: Props) {
  const [pickerIosVisivel, setPickerIosVisivel] = useState(false);

  function abrir() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: paraData(valor),
        mode: 'date',
        onChange: (event, dataSelecionada) => {
          if (event.type === 'set' && dataSelecionada) onSelecionar(paraTexto(dataSelecionada));
        },
      });
    } else {
      setPickerIosVisivel(true);
    }
  }

  return (
    <>
      <Pressable style={styles.input} onPress={abrir}>
        <Text style={valor ? styles.texto : styles.placeholder}>
          {valor ? formatDate(valor) : placeholder}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' && pickerIosVisivel && (
        <DateTimePicker
          value={paraData(valor)}
          mode="date"
          display="spinner"
          onChange={(event, dataSelecionada) => {
            setPickerIosVisivel(false);
            if (event.type === 'set' && dataSelecionada) onSelecionar(paraTexto(dataSelecionada));
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input:       { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  texto:       { fontSize: 16, color: '#000' },
  placeholder: { fontSize: 16, color: '#999' },
});
