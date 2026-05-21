import { useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '../contexts/AuthContext';

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
    const { empresa } = useAuth();

    const tourKey = useCallback((etapa) => {
        const empId = empresa?.id ?? 'demo';
        return `onboarding-tour-${etapa}-${empId}`;
    }, [empresa?.id]);

    const jaViuTour = useCallback((etapa) => {
        return localStorage.getItem(tourKey(etapa)) === '1';
    }, [tourKey]);

    const marcarTourVisto = useCallback((etapa) => {
        localStorage.setItem(tourKey(etapa), '1');
    }, [tourKey]);

    const iniciarTour = useCallback((etapa, steps) => {
        if (jaViuTour(etapa) || !steps?.length) return;

        const selectors = steps.map((s) => s.element).filter(Boolean);

        const run = async () => {
            await waitForSelectors(selectors);
            const d = driver({
                showProgress: true,
                nextBtnText: 'Próximo',
                prevBtnText: 'Voltar',
                doneBtnText: 'Concluir',
                steps,
                onDestroyed: () => marcarTourVisto(etapa),
            });
            d.drive();
        };

        const t = window.setTimeout(() => { run(); }, 450);
        return () => window.clearTimeout(t);
    }, [jaViuTour, marcarTourVisto]);

    return { iniciarTour, jaViuTour, marcarTourVisto, tourKey };
}
