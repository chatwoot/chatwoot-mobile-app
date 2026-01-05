import type { KanbanItem, KanbanAssignedAgent } from '@/store/kanban/kanbanTypes';

/**
 * Extrai o valor monetário de um item do Kanban
 * O valor pode estar em item_details.offers[0].value, item_details.value, ou custom_attributes
 */
export function getItemValue(item: KanbanItem): number | null {
  if (!item.item_details) return null;

  // Tentar extrair de offers (array de ofertas)
  const offers = item.item_details.offers as Array<{ value?: number | string; amount?: number | string }> | undefined;
  if (offers && Array.isArray(offers) && offers.length > 0) {
    const firstOffer = offers[0];
    if (firstOffer?.value !== undefined && firstOffer.value !== null) {
      const value = typeof firstOffer.value === 'string' ? parseFloat(firstOffer.value) : firstOffer.value;
      if (!isNaN(value) && value > 0) return value;
    }
    if (firstOffer?.amount !== undefined && firstOffer.amount !== null) {
      const value = typeof firstOffer.amount === 'string' ? parseFloat(firstOffer.amount) : firstOffer.amount;
      if (!isNaN(value) && value > 0) return value;
    }
  }

  // Tentar extrair de um campo value direto (se existir)
  const directValue = (item.item_details as { value?: number | string; amount?: number | string }).value;
  if (directValue !== undefined && directValue !== null) {
    const value = typeof directValue === 'string' ? parseFloat(directValue) : directValue;
    if (!isNaN(value) && value > 0) return value;
  }

  // Tentar extrair de amount direto
  const directAmount = (item.item_details as { amount?: number | string }).amount;
  if (directAmount !== undefined && directAmount !== null) {
    const value = typeof directAmount === 'string' ? parseFloat(directAmount) : directAmount;
    if (!isNaN(value) && value > 0) return value;
  }

  // Tentar extrair de custom_attributes (se existir um campo de valor)
  const customAttributes = item.item_details.custom_attributes as Record<string, unknown> | undefined;
  if (customAttributes) {
    // Procurar por campos comuns de valor
    const valueFields = ['value', 'amount', 'price', 'valor', 'preco'];
    for (const field of valueFields) {
      const fieldValue = customAttributes[field];
      if (fieldValue !== undefined && fieldValue !== null) {
        const value = typeof fieldValue === 'string' ? parseFloat(fieldValue) : Number(fieldValue);
        if (!isNaN(value) && value > 0) return value;
      }
    }
  }

  return null;
}

/**
 * Formata um valor monetário para exibição
 * Ex: 500000 -> "R$ 500.000,00" ou "R$ 500K"
 */
export function formatCurrency(
  value: number | null,
  currency: { symbol?: string; locale?: string } = { symbol: 'R$', locale: 'pt-BR' },
  compact: boolean = false,
): string {
  if (value === null || isNaN(value)) return '';

  const symbol = currency.symbol || 'R$';
  const locale = currency.locale || 'pt-BR';

  if (compact && value >= 1000) {
    // Formato compacto: R$ 500K, R$ 1.5M
    if (value >= 1000000) {
      const millions = value / 1000000;
      return `${symbol} ${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
    }
    if (value >= 1000) {
      const thousands = value / 1000;
      return `${symbol} ${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K`;
    }
  }

  // Formato completo: R$ 500.000,00
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace('R$', symbol);
}

/**
 * Formata as iniciais dos agentes como texto
 * Ex: [{name: "Cristyan Marcel"}, {name: "João"}] -> "CM, J"
 */
export function formatAgentInitials(agents: KanbanAssignedAgent[]): string {
  if (!agents || agents.length === 0) return '';

  return agents
    .map(agent => {
      if (!agent.name) return '';
      const parts = agent.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        // Primeira letra do primeiro nome + primeira letra do último nome
        return `${parts[0].charAt(0).toUpperCase()}${parts[parts.length - 1].charAt(0).toUpperCase()}`;
      }
      // Apenas primeira letra se tiver só um nome
      return parts[0].charAt(0).toUpperCase();
    })
    .filter(initials => initials.length > 0)
    .join(', ');
}

/**
 * Calcula estatísticas de uma etapa do Kanban
 */
export function calculateStageStats(items: KanbanItem[]): {
  itemCount: number;
  uniqueAgentsCount: number;
  totalValue: number;
  uniqueAgentIds: Set<number>;
} {
  const uniqueAgentIds = new Set<number>();
  let totalValue = 0;

  items.forEach(item => {
    // Contar agentes únicos
    if (item.assigned_agents && item.assigned_agents.length > 0) {
      item.assigned_agents.forEach(agent => {
        if (agent.id) {
          uniqueAgentIds.add(agent.id);
        }
      });
    }

    // Somar valores
    const itemValue = getItemValue(item);
    if (itemValue !== null) {
      totalValue += itemValue;
    }
  });

  return {
    itemCount: items.length,
    uniqueAgentsCount: uniqueAgentIds.size,
    totalValue,
    uniqueAgentIds,
  };
}

