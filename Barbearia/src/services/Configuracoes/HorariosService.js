import { api } from '../api';

const BASE_PATH = '/api/Configuracoes/Horarios';

export const HorariosService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        // O C# com [ApiController] espera JSON para objetos complexos passados no body. Removemos urlencoded.
        return api.post(`${BASE_PATH}/carregargrid-horariostrabalho?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    editar: (idItem) => {
        // [HttpPost("editar-horariostrabalho")]
        return api.post(`${BASE_PATH}/editar-horariostrabalho?idItem=${idItem}`);
    },
    alterar: (dados) => {
        // [HttpPost("alterar-profissionais")]
        return api.post(`${BASE_PATH}/alterar-profissionais`, dados);
    },
    alterarStatus: (id, status = 0) => {
        // [HttpPut("alterar-status-horarios/{id}")] com [FromBody] int status
        return api.put(`${BASE_PATH}/alterar-status-horarios/${id}`, status, {
            headers: { 'Content-Type': 'application/json' }
        });
    },
    deletar: (idItem) => {
        // [HttpPost("excluir-horariostrabalho")]
        return api.post(`${BASE_PATH}/excluir-horariostrabalho?idItem=${idItem}`);
    }
};
