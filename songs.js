import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import LikedScreen from '../screens/LikedScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home:    { active: 'home',          inactive: 'home-outline' },
  Search:  { active: 'search',        inactive: 'search-outline' },
  Library: { active: 'library',       inactive: 'library-outline' },
  Liked:   { active: 'heart',         inactive: 'heart-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            const icons = ICONS[route.name];
            return (
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={24}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: '#9B59B6',
          tabBarInactiveTintColor: '#444',
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'rgba(10,10,15,0.95)',
            borderTopColor: 'rgba(155,89,182,0.2)',
            borderTopWidth: 1,
            height: 54,
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 1 },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home"    component={HomeScreen}    />
        <Tab.Screen name="Search"  component={SearchScreen}  />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Liked"   component={LikedScreen}   />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
