using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.Configuracoes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Repositorios.Agendamentos
{
    public interface IVitrineRepositorio : IDisposable
    {
        Task<Empresa> CarregarEmpresaPorSlug(string slug);
        Task<IEnumerable<Servico>> CarregarServicosPublicos(long idEmpresa);
        Task<IEnumerable<Profissional>> CarregarProfissionaisPublicos(long idEmpresa);
        Task<IEnumerable<string>> CarregarHorariosLivres(long idProfissional, DateTime data);
        Task<VitrineConfirmarRetornoDTO> ConfirmarAgendamento(VitrineConfirmarDTO dados);
    }
}
