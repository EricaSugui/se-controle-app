import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

type Props = Omit<TextInputProps, 'value' | 'onChange' | 'onChangeText' | 'keyboardType'> & {
  value: number | null;
  onChange: (value: number | null) => void;
};

const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Máscara "centavos primeiro": cada dígito digitado empurra os anteriores
// para a esquerda (ex: apps bancários). Evita que o TextInput aceite vírgula
// como separador decimal, que o Number() do JS não interpreta corretamente
// — o estado sempre fica como number, pronto para ir direto pro JSON da API.
export function CurrencyInput({ value, onChange, style, placeholder, ...rest }: Props) {
  function handleChangeText(texto: string) {
    const digitos = texto.replace(/\D/g, '');
    onChange(digitos === '' ? null : Number(digitos) / 100);
  }

  return (
    <TextInput
      {...rest}
      style={[styles.input, style]}
      value={value != null ? formatador.format(value) : ''}
      onChangeText={handleChangeText}
      keyboardType="number-pad"
      placeholder={placeholder ?? formatador.format(0)}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
});
