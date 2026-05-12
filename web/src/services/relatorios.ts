import { apiFetch } from "./api";
import { useEffect, useState } from "react";

export function useRelatoriosBI() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState<any>(null);

    // Mock de resiliência caso a base do desenvolvedor ou API esteja vazia/off temporariamente.
    const fallbackData = {
        kpis: {
            volumeTotal: 4250000,
            repasseEstimado: 127500,
            contratosAtivos: 1245,
        },
        graficoVolume: [
            { name: "Jan", volume: 400000 },
            { name: "Fev", volume: 300000 },
            { name: "Mar", volume: 550000 },
            { name: "Abr", volume: 450000 },
            { name: "Mai", volume: 600000 },
        ],
        graficoRepasse: [
            { name: "Jan", repasse: 12000 },
            { name: "Fev", repasse: 9000 },
            { name: "Mar", repasse: 16500 },
            { name: "Abr", repasse: 13500 },
            { name: "Mai", repasse: 18000 },
        ],
        ranking: [
            {
                id: 1,
                banco: "Banco do Brasil",
                operacoes: 342,
                volume: "R$ 1.250.000,00",
                repasse: "R$ 37.500,00",
            },
            {
                id: 2,
                banco: "Caixa Econômica",
                operacoes: 289,
                volume: "R$ 980.000,00",
                repasse: "R$ 29.400,00",
            },
            {
                id: 3,
                banco: "Itaú Unibanco",
                operacoes: 156,
                volume: "R$ 640.000,00",
                repasse: "R$ 19.200,00",
            },
        ],
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await apiFetch("/v1/relatorios/bi");
                setData(result || fallbackData);
            } catch (err) {
                setIsError(err);
                setData(fallbackData);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return { data, isLoading, isError };
}