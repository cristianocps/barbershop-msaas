using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Interfaces.Repositorios.Agendamentos;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Aplicacao.Entidades.Agendamentos
{
    public class VitrineServicos : IVitrineServicos
    {
        private readonly IVitrineRepositorio _vitrineRepositorio;
        public VitrineServicos(IVitrineRepositorio vitrineRepositorio)
        {
            _vitrineRepositorio = vitrineRepositorio;
        }

        public async Task<Empresa> CarregarEmpresaPorSlug(string slug)
        {
            return await _vitrineRepositorio.CarregarEmpresaPorSlug(slug).ConfigureAwait(true);
        }

        public async Task<IEnumerable<string>> CarregarHorariosLivres(long idProfissional, DateTime data)
        {
            return await _vitrineRepositorio.CarregarHorariosLivres(idProfissional, data).ConfigureAwait(true);
        }

        public async Task<IEnumerable<Profissional>> CarregarProfissionaisPublicos(long idEmpresa)
        {
            return await _vitrineRepositorio.CarregarProfissionaisPublicos(idEmpresa).ConfigureAwait(true);
        }

        public async Task<IEnumerable<Servico>> CarregarServicosPublicos(long idEmpresa)
        {
            return await _vitrineRepositorio.CarregarServicosPublicos(idEmpresa).ConfigureAwait(true);
        }

        public async Task<VitrineConfirmarRetornoDTO> ConfirmarAgendamento(VitrineConfirmarDTO dados)
        {
            return await _vitrineRepositorio.ConfirmarAgendamento(dados).ConfigureAwait(true);
        }

        public async Task<IEnumerable<dynamic>> CarregarDadosBancariosPublicos(long idEmpresa)
        {
            return await _vitrineRepositorio.CarregarDadosBancariosPublicos(idEmpresa).ConfigureAwait(true);
        }

        public void Dispose()
        {
            _vitrineRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
