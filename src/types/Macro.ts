export interface Macro {
  id: number;
  name: string;
  hasChevron: boolean;
  actions: MacroAction[];
}

export interface MacroAction {
  actionName: string;
  actionParams: (string | number)[];
}
