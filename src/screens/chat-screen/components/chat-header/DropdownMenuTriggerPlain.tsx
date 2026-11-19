import React from 'react';
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

export const DropdownMenuTriggerPlain = DropdownMenu.create<
  React.ComponentProps<typeof DropdownMenu.Trigger>
>(
  props => (
    <DropdownMenu.Trigger {...props} asChild>
      <View aria-role="button">{props.children}</View>
    </DropdownMenu.Trigger>
  ),
  'Trigger',
);
