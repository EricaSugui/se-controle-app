import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

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
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#6200ee'} />
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },

  primary: { backgroundColor: '#6200ee' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#6200ee' },
  ghost:   { backgroundColor: 'transparent' },

  pressed:  { opacity: 0.75 },
  disabled: { opacity: 0.4 },

  label:        { fontSize: 16, fontWeight: '600' },
  primaryLabel: { color: '#fff' },
  outlineLabel: { color: '#6200ee' },
  ghostLabel:   { color: '#6200ee' },
});
