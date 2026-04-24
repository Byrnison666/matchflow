import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { useChatStore } from '@/lib/store/chat.store'

function TabIcon({ label, emoji }: { label: string; emoji: string }) {
  return (
    <View className="items-center gap-0.5">
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </View>
  )
}

function MatchesTabIcon({ emoji }: { emoji: string }) {
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0)

  return (
    <View className="items-center">
      <View>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        {totalUnread > 0 && (
          <View
            className="absolute -top-1 -right-2 bg-accent-from rounded-full min-w-4 h-4 items-center justify-center px-0.5"
          >
            <Text className="text-white text-[9px] font-bold">
              {totalUnread > 99 ? '99+' : totalUnread}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#101014',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: '#FF4B6E',
        tabBarInactiveTintColor: '#6B6B6B',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Поиск',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🔥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Мэтчи',
          tabBarIcon: () => <MatchesTabIcon emoji="💬" />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  )
}
