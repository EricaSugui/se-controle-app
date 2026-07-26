import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { cores, raio } from '@/src/theme/tokens';

type Variant = 'primary' | 'outline' | 'ghost';

type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading = false, disabled, style, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? cores.textoInverso : cores.primaria} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },

  primary: { backgroundColor: cores.primaria },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: cores.primaria },
  ghost:   { backgroundColor: 'transparent' },

  pressed:  { opacity: 0.75 },
  disabled: { opacity: 0.4 },

  label:        { fontSize: 16, fontWeight: '600' },
  primaryLabel: { color: cores.textoInverso },
  outlineLabel: { color: cores.primaria },
  ghostLabel:   { color: cores.primaria },
});
