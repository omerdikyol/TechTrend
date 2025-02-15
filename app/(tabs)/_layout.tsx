import { Stack } from 'expo-router';
import { useTheme } from '../../constants/theme';

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}