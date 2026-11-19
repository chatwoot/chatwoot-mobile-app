import React from 'react';
import * as DropdownMenu from 'zeego/dropdown-menu';

export type MenuItemSpec = { key: string; title: string; icon: string; onSelect: () => void };

export const renderItem = ({ key, title, icon, onSelect }: MenuItemSpec) => (
  <DropdownMenu.Item key={key} onSelect={onSelect}>
    <DropdownMenu.ItemIcon ios={{ name: icon as never }} />
    <DropdownMenu.ItemTitle>{title}</DropdownMenu.ItemTitle>
  </DropdownMenu.Item>
);
