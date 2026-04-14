using BarberShop.Controllers;
using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using BarberShop.Infraestrutura.padronizar;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;
using static BarberShop.Dominio.Enuns.IGroupPolicies;
using static BarberShop.Dominio.Enuns.IResponseController;

namespace BarberShop.Areas.Agendamentos
{
    [ApiController]
    [AllowAnonymous]
    [Area("Agendamentos")]
    [Route("api/[area]/[controller]")]
    public class VitrineController : BasicController
    {

        private readonly IVitrineServicos _vitrineServicos;

        public VitrineController([FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IVitrineServicos vitrineServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles)
            : base(environment, Policy.Consulta, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        { _vitrineServicos = vitrineServicos; }

        // ─────────────────────────────────────────────
        // 1. Carrega empresa pelo slug
        // GET /api/Agendamentos/Vitrine/empresa/{slug}
        // ─────────────────────────────────────────────
        [HttpGet("empresa/{slug}")]
        public async Task<IActionResult> CarregarEmpresa(string slug)
        {
            try
            {
                var result = await _vitrineServicos.CarregarEmpresaPorSlug(slug);
                return await ResponseJson(ResponseJsonTypes.Success, "", result);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        // ─────────────────────────────────────────────
        // 2. Lista serviços ativos da empresa
        // GET /api/Agendamentos/Vitrine/servicos/{idEmpresa}
        // ─────────────────────────────────────────────
        [HttpGet("servicos/{idEmpresa}")]
        public async Task<IActionResult> CarregarServicos(long idEmpresa)
        {
            try
            {
                var result = await _vitrineServicos.CarregarServicosPublicos(idEmpresa);
                return await ResponseJson(ResponseJsonTypes.Success, "", result);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        // ─────────────────────────────────────────────
        // 3. Lista profissionais ativos da empresa
        // GET /api/Agendamentos/Vitrine/profissionais/{idEmpresa}
        // ─────────────────────────────────────────────
        [HttpGet("profissionais/{idEmpresa}")]
        public async Task<IActionResult> CarregarProfissionais(long idEmpresa)
        {
            try
            {
                var result = await _vitrineServicos.CarregarProfissionaisPublicos(idEmpresa);
                return await ResponseJson(ResponseJsonTypes.Success, "", result);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        // ─────────────────────────────────────────────
        // 4. Horários livres do profissional no dia
        // GET /api/Agendamentos/Vitrine/horarios?idProfissional=X&data=2025-04-04
        // ─────────────────────────────────────────────
        [HttpGet("horarios")]
        public async Task<IActionResult> CarregarHorariosLivres(long idProfissional, DateTime data)
        {
            try
            {
                var result = await _vitrineServicos.CarregarHorariosLivres(idProfissional, data);
                return await ResponseJson(ResponseJsonTypes.Success, "", result);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        // ─────────────────────────────────────────────
        // 5. Confirma o agendamento (a transação principal)
        // POST /api/Agendamentos/Vitrine/confirmar
        // ─────────────────────────────────────────────
        [HttpPost("confirmar")]
        public async Task<IActionResult> ConfirmarAgendamento([FromBody] VitrineConfirmarDTO dados)
        {
            try
            {
                if (dados == null) throw new TratamentoExcecao("Dados inválidos.");
                var result = await _vitrineServicos.ConfirmarAgendamento(dados);
                return await ResponseJson(ResponseJsonTypes.Success, "Agendamento confirmado!", result);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }
    }
}
