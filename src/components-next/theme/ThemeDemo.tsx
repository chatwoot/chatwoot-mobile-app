/**
 * Theme Demo Component
 * 
 * This component demonstrates the unified theme system in action,
 * showing how components automatically adapt to light and dark themes.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { useTheme } from '@/context';

export const ThemeDemo: React.FC = () => {
  const { tailwind, isDark, toggleTheme, setTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);

  return (
    <ScrollView style={tailwind.style('flex-1 bg-background')}>
      <View style={tailwind.style('p-4')}>
        {/* Header */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-2xl font-bold text-foreground mb-2')}>
            Unified Theme Demo
          </Text>
          <Text style={tailwind.style('text-sm text-muted')}>
            Demonstrating the unified theme system that matches the web application
          </Text>
        </View>

        {/* Theme Controls */}
        <View style={tailwind.style('bg-surface border border-border rounded-lg p-4 mb-6')}>
          <Text style={tailwind.style('text-lg font-semibold text-foreground mb-4')}>
            Theme Controls
          </Text>
          
          <View style={tailwind.style('flex-row items-center justify-between mb-4')}>
            <Text style={tailwind.style('text-foreground')}>Current Theme:</Text>
            <Text style={tailwind.style('text-primary font-medium')}>
              {isDark ? 'Dark' : 'Light'}
            </Text>
          </View>

          <View style={tailwind.style('flex-row gap-3')}>
            <TouchableOpacity
              style={tailwind.style('flex-1 bg-primary px-4 py-2 rounded-lg')}
              onPress={toggleTheme}
            >
              <Text style={tailwind.style('text-white text-center font-medium')}>
                Toggle Theme
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={tailwind.style('flex-1 bg-surface border border-border px-4 py-2 rounded-lg')}
              onPress={() => setTheme('system')}
            >
              <Text style={tailwind.style('text-foreground text-center font-medium')}>
                System
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Color Palette Demo */}
        <View style={tailwind.style('bg-surface border border-border rounded-lg p-4 mb-6')}>
          <Text style={tailwind.style('text-lg font-semibold text-foreground mb-4')}>
            Color Palette
          </Text>
          
          <View style={tailwind.style('gap-3')}>
            {/* Background Colors */}
            <View>
              <Text style={tailwind.style('text-sm text-muted mb-2')}>Backgrounds</Text>
              <View style={tailwind.style('flex-row gap-2')}>
                <View style={tailwind.style('w-12 h-12 bg-background border border-border rounded')} />
                <View style={tailwind.style('w-12 h-12 bg-surface border border-border rounded')} />
                <View style={tailwind.style('w-12 h-12 bg-surface-elevated border border-border rounded')} />
              </View>
            </View>

            {/* Text Colors */}
            <View>
              <Text style={tailwind.style('text-sm text-muted mb-2')}>Text Colors</Text>
              <View style={tailwind.style('gap-1')}>
                <Text style={tailwind.style('text-foreground')}>Primary Text</Text>
                <Text style={tailwind.style('text-secondary')}>Secondary Text</Text>
                <Text style={tailwind.style('text-muted')}>Muted Text</Text>
              </View>
            </View>

            {/* Interactive Colors */}
            <View>
              <Text style={tailwind.style('text-sm text-muted mb-2')}>Interactive Colors</Text>
              <View style={tailwind.style('flex-row gap-2')}>
                <View style={tailwind.style('w-12 h-12 bg-primary rounded')} />
                <View style={tailwind.style('w-12 h-12 bg-accent rounded')} />
                <View style={tailwind.style('w-12 h-12 bg-success rounded')} />
                <View style={tailwind.style('w-12 h-12 bg-warning rounded')} />
                <View style={tailwind.style('w-12 h-12 bg-error rounded')} />
              </View>
            </View>
          </View>
        </View>

        {/* Form Elements Demo */}
        <View style={tailwind.style('bg-surface border border-border rounded-lg p-4 mb-6')}>
          <Text style={tailwind.style('text-lg font-semibold text-foreground mb-4')}>
            Form Elements
          </Text>
          
          <View style={tailwind.style('gap-4')}>
            {/* Text Input */}
            <View>
              <Text style={tailwind.style('text-sm text-foreground mb-2')}>Text Input</Text>
              <TextInput
                style={tailwind.style('bg-input border border-input-border rounded-lg px-3 py-2 text-foreground')}
                placeholder="Enter text here..."
                placeholderTextColor={tailwind.color('text-muted')}
                value={inputValue}
                onChangeText={setInputValue}
              />
            </View>

            {/* Switch */}
            <View style={tailwind.style('flex-row items-center justify-between')}>
              <Text style={tailwind.style('text-foreground')}>Toggle Switch</Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                trackColor={{ false: tailwind.color('border'), true: tailwind.color('primary') }}
                thumbColor={switchValue ? tailwind.color('white') : tailwind.color('text-muted')}
              />
            </View>
          </View>
        </View>

        {/* Button Variants Demo */}
        <View style={tailwind.style('bg-surface border border-border rounded-lg p-4 mb-6')}>
          <Text style={tailwind.style('text-lg font-semibold text-foreground mb-4')}>
            Button Variants
          </Text>
          
          <View style={tailwind.style('gap-3')}>
            <TouchableOpacity style={tailwind.style('bg-primary px-4 py-3 rounded-lg')}>
              <Text style={tailwind.style('text-white text-center font-medium')}>
                Primary Button
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={tailwind.style('bg-surface border border-border px-4 py-3 rounded-lg')}>
              <Text style={tailwind.style('text-foreground text-center font-medium')}>
                Secondary Button
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={tailwind.style('bg-accent px-4 py-3 rounded-lg')}>
              <Text style={tailwind.style('text-white text-center font-medium')}>
                Accent Button
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={tailwind.style('bg-destructive px-4 py-3 rounded-lg')}>
              <Text style={tailwind.style('text-white text-center font-medium')}>
                Destructive Button
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Indicators Demo */}
        <View style={tailwind.style('bg-surface border border-border rounded-lg p-4 mb-6')}>
          <Text style={tailwind.style('text-lg font-semibold text-foreground mb-4')}>
            Status Indicators
          </Text>
          
          <View style={tailwind.style('gap-3')}>
            <View style={tailwind.style('flex-row items-center gap-3')}>
              <View style={tailwind.style('w-3 h-3 bg-success rounded-full')} />
              <Text style={tailwind.style('text-foreground')}>Online</Text>
            </View>
            
            <View style={tailwind.style('flex-row items-center gap-3')}>
              <View style={tailwind.style('w-3 h-3 bg-warning rounded-full')} />
              <Text style={tailwind.style('text-foreground')}>Away</Text>
            </View>
            
            <View style={tailwind.style('flex-row items-center gap-3')}>
              <View style={tailwind.style('w-3 h-3 bg-error rounded-full')} />
              <Text style={tailwind.style('text-foreground')}>Busy</Text>
            </View>
            
            <View style={tailwind.style('flex-row items-center gap-3')}>
              <View style={tailwind.style('w-3 h-3 bg-muted rounded-full')} />
              <Text style={tailwind.style('text-foreground')}>Offline</Text>
            </View>
          </View>
        </View>

        {/* Border Demo */}
        <View style={tailwind.style('bg-surface border border-border rounded-lg p-4')}>
          <Text style={tailwind.style('text-lg font-semibold text-foreground mb-4')}>
            Border Variants
          </Text>
          
          <View style={tailwind.style('gap-3')}>
            <View style={tailwind.style('border border-border p-3 rounded')}>
              <Text style={tailwind.style('text-foreground')}>Default Border</Text>
            </View>
            
            <View style={tailwind.style('border border-border-strong p-3 rounded')}>
              <Text style={tailwind.style('text-foreground')}>Strong Border</Text>
            </View>
            
            <View style={tailwind.style('border border-primary p-3 rounded')}>
              <Text style={tailwind.style('text-foreground')}>Primary Border</Text>
            </View>
            
            <View style={tailwind.style('border border-destructive p-3 rounded')}>
              <Text style={tailwind.style('text-foreground')}>Error Border</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
