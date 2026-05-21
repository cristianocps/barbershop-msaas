/**
 * Passos do driver.js — cada passo deve apontar para o elemento que a descrição menciona.
 * Ordem típica: título da página → botão de ação → lista/conteúdo.
 */

function step(selector, title, description, side = 'bottom') {
    if (!selector) return null;
    return {
        element: selector,
        popover: { title, description, side },
    };
}

function filterSteps(steps) {
    return steps.filter(Boolean);
}

export const TOURS = {
    minhaBarbearia({ isDemo }) {
        return filterSteps([
            step('[data-tour="minha-barbearia-intro"]', 'Sua unidade', 'Aqui você define nome, contato, endereço e link público de agendamento da sua barbearia.'),
            isDemo
                ? step('[data-tour="minha-barbearia-salvar"]', 'Sair da demonstração', 'Preencha os dados e clique em salvar para criar sua barbearia real no sistema.')
                : step('[data-tour="minha-barbearia-salvar"]', 'Dados da unidade', 'Mantenha nome, slug e logo atualizados para seus clientes encontrarem você na vitrine.'),
        ]);
    },

    empresa({ showWelcome, showNovo }) {
        if (showWelcome) {
            return filterSteps([
                step('[data-tour="empresas-welcome-cadastrar"]', 'Primeira unidade', 'Use este botão para cadastrar a barbearia real (quem está na unidade de demonstração).'),
            ]);
        }
        return filterSteps([
            step('[data-tour="empresas-page-intro"]', 'Barbearias', 'Painel da plataforma: gerencie todas as unidades cadastradas no sistema.'),
            showNovo
                ? step('[data-tour="empresas-novo"]', 'Nova empresa', 'Clique aqui para cadastrar outra barbearia na rede.')
                : null,
            step('[data-tour="empresas-grid"]', 'Lista', 'Visualize, edite ou abra a vitrine de cada unidade.'),
        ]);
    },

    servicos({ hasNewButton = true }) {
        return filterSteps([
            step('[data-tour="servicos-page-intro"]', 'Serviços', 'Catálogo de atendimentos da sua barbearia (preço, duração, status).'),
            hasNewButton
                ? step('[data-tour="servicos-novo"]', 'Novo serviço', 'Clique em "Novo Serviço" para adicionar corte, barba, combo, etc.')
                : null,
            step('[data-tour="servicos-grid"]', 'Lista', 'Aqui aparecem os serviços cadastrados. Você pode editar ou inativar cada um.'),
        ]);
    },

    profissionais({ hasNewButton = true }) {
        return filterSteps([
            step('[data-tour="profissionais-page-intro"]', 'Profissionais', 'Equipe que realiza os atendimentos na unidade.'),
            hasNewButton
                ? step('[data-tour="profissionais-novo"]', 'Novo profissional', 'Clique em "Novo Profissional" para cadastrar um barbeiro.')
                : null,
            step('[data-tour="profissionais-grid"]', 'Lista', 'Depois de cadastrar, configure os horários em Cadastros → Horários.'),
        ]);
    },

    pagamentos({ hasNewButton = true }) {
        return filterSteps([
            step('[data-tour="pagamentos-page-intro"]', 'PIX manual', 'Chaves PIX usadas na vitrine e ao concluir agendamentos.'),
            hasNewButton
                ? step('[data-tour="pagamentos-novo"]', 'Nova chave', 'Clique no botão de nova chave (ou tipo) conforme a aba ativa.')
                : null,
            step('[data-tour="pagamentos-tabs"]', 'Abas', 'Alterne entre chaves PIX e tipos de chave. Para Infinite Pay, use Configurações → Infinite Pay.'),
        ]);
    },
};
