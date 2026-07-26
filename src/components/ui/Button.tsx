import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { cores, raio } from '@/src/theme/tokens';
import { useHover } from '@/src/hooks/useHover';

type Variant = 'primary' | 'outline' | 'ghost';

type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading = false, disabled, style, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;

  const { hover, hoverProps } = useHover();
  const hovered = hover && !isDisabled;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        hovered && (variant === 'primary' ? styles.hoveredCheio : styles.hoveredVazado),
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...hoverProps}
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

  // Cheio escurece de leve; vazado ganha fundo, porque opacidade em texto
  // sobre transparente quase não se lê. Pressed continua mais forte que
  // hover, então o gesto lê como progressão.
  hoveredCheio:  { opacity: 0.9 },
  hoveredVazado: { backgroundColor: cores.primariaSuave },

  pressed:  { opacity: 0.75 },
  disabled: { opacity: 0.4 },

  label:        { fontSize: 16, fontWeight: '600' },
  primaryLabel: { color: cores.textoInverso },
  outlineLabel: { color: cores.primaria },
  ghostLabel:   { color: cores.primaria },
});
