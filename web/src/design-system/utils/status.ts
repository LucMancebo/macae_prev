import type { BadgeProps } from '../components/Badge/Badge';

export function resolveBadgeTone(value: string): BadgeProps['tone'] {
    switch (value.toLowerCase()) {
        case 'ativo':
        case 'inclusao':
            return 'success';
        case 'bloqueado':
        case 'exclusao':
            return 'danger';
        case 'suspenso':
        case 'alteracao':
            return 'warning';
        default:
            return 'neutral';
    }
}