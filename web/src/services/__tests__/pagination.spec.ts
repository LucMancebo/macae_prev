import { describe, it, expect, vi } from 'vitest';
import * as consignatarias from '../consignatarias';
import * as api from '../api';

describe('serviços de paginação', () => {
    it('listarConsignatarias envia page e limit corretos', async () => {
        const spy = vi.spyOn(api, 'apiFetch').mockResolvedValue({ items: [], pagination: { page: 2, limit: 10, total: 0 } });

        const res = await consignatarias.listarConsignatarias(2, 10, 'ATIVA');

        expect(spy).toHaveBeenCalled();
        const calledWith = spy.mock.calls[0][0] as string;
        expect(calledWith).toContain('page=2');
        expect(calledWith).toContain('limit=10');
        expect(calledWith).toContain('status=ATIVA');

        spy.mockRestore();
    });
});
