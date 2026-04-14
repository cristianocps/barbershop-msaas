using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Agendamentos;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Agendamentos
{
    public class AgendamentoServicos : IAgendamentoServicos
    {
        private readonly IAgendamentoRepositorio _agendamentoRepositorio;
        public AgendamentoServicos(IAgendamentoRepositorio agendamentoRepositorio)
        {
            _agendamentoRepositorio = agendamentoRepositorio;
        }

        public async Task<long> AlterarAgendamentos(Agendamento dados)
        {
            return await _agendamentoRepositorio.AlterarAgendamentos(dados).ConfigureAwait(true);
        }

        public async Task<long> AlterarStatusAgendamento(long id, int status)
        {
            return await _agendamentoRepositorio.AlterarStatusAgendamento(id, status).ConfigureAwait(true);
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboAgendamentos(string search, int page, int? length = 10)
        {
            return await _agendamentoRepositorio.CarregarComboAgendamentos(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<Agendamento>> CarregarGridAgendamentos(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _agendamentoRepositorio.CarregarGridAgendamentos(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<Agendamento> Editar(long idItem)
        {
            return await _agendamentoRepositorio.Editar(idItem).ConfigureAwait(false);
        }


        public void Dispose()
        {
            _agendamentoRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
