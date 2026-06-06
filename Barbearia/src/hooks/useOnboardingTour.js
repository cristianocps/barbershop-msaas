import { useCallback, useEffect, useRef, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { OnboardingService } from '../services/Configuracoes/OnboardingService';

function waitForSelectors(selectors, timeoutMs = 4000) {
    const list = selectors.filter(Boolean);
    if (!list.length) return Promise.resolve(true);

    return new Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
            const ready = list.every((sel) => document.querySelector(sel));
            if (ready || Date.now() - start >= timeoutMs) {
                resolve(ready);
                return;
            }
            requestAnimationFrame(tick);
        };
        tick();
    });
}

export function useOnboardingTour() {
    const [tourData, setTourData] = useState(null);
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;

        OnboardingService.obterStatus()
            .then((res) => {
                const status = res?.data ?? res?.Data ?? {};
                setTourData(status.etapasTour ?? {});
            })
            .catch(() => setTourData({}));
    }, []);

    const jaViuTour = useCallback((etapa) => {
        return tourData?.[etapa] === true;
    }, [tourData]);

    const marcarTourVisto = useCallback((etapa) => {
        setTourData((prev) => {
            const updated = { ...prev, [etapa]: true };
            OnboardingService.salvarEtapasTour(JSON.stringify(updated)).catch(() => {});
            return updated;
        });
    }, []);

    const iniciarTour = useCallback((etapa, steps) => {
        if (tourData === null || jaViuTour(etapa) || !steps?.length) return;

        const selectors = steps.map((s) => s.element).filter(Boolean);

        const run = async () => {
            await waitForSelectors(selectors);
            const d = driver({
                showProgress: true,
                nextBtnText: 'Pr\u00f3ximo',
                prevBtnText: 'Voltar',
                doneBtnText: 'Concluir',
                steps,
                onDestroyed: () => marcarTourVisto(etapa),
            });
            d.drive();
        };

        const t = window.setTimeout(() => { run(); }, 450);
        return () => window.clearTimeout(t);
    }, [tourData, jaViuTour, marcarTourVisto]);

    return { iniciarTour, jaViuTour, marcarTourVisto };
}
