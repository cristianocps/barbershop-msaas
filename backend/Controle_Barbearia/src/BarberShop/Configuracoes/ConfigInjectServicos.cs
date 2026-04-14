using BarberShop.Aplicacao.Entidades.Acessos;
using BarberShop.Aplicacao.Entidades.Agendamentos;
using BarberShop.Aplicacao.Entidades.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Acessos;
using BarberShop.Dominio.Interfaces.Repositorios.Agendamentos;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using BarberShop.Repositorio.Repositorio.Acessos;
using BarberShop.Repositorio.Repositorio.Agendamentos;
using BarberShop.Repositorio.Repositorio.Configuracoes;
using BarberShop.Repositorio.Servicos;
using System.Diagnostics;

namespace BarberShop.Configuracoes
{
    [DebuggerStepThrough]
    public static class ConfigInjectServicos
    {
        public static void RegistrarServicosGestao(this IServiceCollection services)
        {
            #region injeção
            

            services.AddScoped<IDbConnectionFactory, PgSystemConnect>();

            // identidade global para os repositórios
            services.AddScoped<TransferenciaIdentidadeDTO>();

            // perfil
            services.AddScoped<IPerfilServicos, PerfilServicos>();
            services.AddScoped<IPerfilRepositorio, PerfilRepositorio>();

            // usuarios
            services.AddScoped<IUsuarioServicos, UsuarioServicos>();
            services.AddScoped<IUsuarioRepositorio, UsuarioRepositorio>();

            // Configuracoes
            services.AddScoped<IEmpresaServicos, EmpresaServicos>();
            services.AddScoped<IEmpresaRepositorio, EmpresaRepositorio>();

            // Servicos
            services.AddScoped<IServicoServicos, ServicoServicos>();
            services.AddScoped<IServicoRepositorio, ServicosRepositorio>();

            // Agendamentos
            services.AddScoped<IAgendamentoServicos, AgendamentoServicos>();
            services.AddScoped<IAgendamentoRepositorio, AgendamentosRepositorio>();

            // Vitrine
            services.AddScoped<IVitrineServicos, VitrineServicos>();
            services.AddScoped<IVitrineRepositorio, VitrineRepositorio>();

            // Profissionais
            services.AddScoped<IProfissionalServicos, ProfissionalServicos>();
            services.AddScoped<IProfissionalRepositorio, ProfissionalRepositorio>();

            // Horarios de Trabalho
            services.AddScoped<IHorarioTrabalhoServicos, HorarioTrabalhoServicos>();
            services.AddScoped<IHorarioTrabalhoRepositorio, HorarioTrabalhoRepositorio>();

            // Clientes
            services.AddScoped<IClienteServicos, ClienteServicos>();
            services.AddScoped<IClienteRepositorio, ClienteRepositorio>();


            // Clientes
            services.AddScoped<IHorarioTrabalhoServicos, HorarioTrabalhoServicos>();
            services.AddScoped<IHorarioTrabalhoRepositorio, HorarioTrabalhoRepositorio>();

            #endregion
        }

    }
}
