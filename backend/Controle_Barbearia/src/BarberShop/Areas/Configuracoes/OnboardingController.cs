using BarberShop.Controllers;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;
using static BarberShop.Dominio.Enuns.IGroupPolicies;

namespace BarberShop.Areas.Configuracoes
{
    [Authorize]
    [ApiController]
    [Area("Configuracoes")]
    [Route("api/[area]/[controller]")]
    public class OnboardingController : BasicController
    {
        private readonly IOnboardingServicos _onboarding;

        public OnboardingController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IOnboardingServicos onboarding,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Consulta, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        {
            _onboarding = onboarding;
        }

        [HttpGet("status")]
        public async Task<IActionResult> Status()
        {
            var status = await _onboarding.ObterStatusAsync().ConfigureAwait(false);
            return Ok(new { data = status });
        }

        [HttpPost("concluir")]
        public async Task<IActionResult> Concluir()
        {
            await _onboarding.MarcarCompletoAsync().ConfigureAwait(false);
            return Ok(new { success = true });
        }

        [HttpPut("etapas-tour")]
        public async Task<IActionResult> SalvarEtapasTour([FromBody] EtapasTourBody body)
        {
            await _onboarding.SalvarEtapasTourAsync(body.Json ?? "{}").ConfigureAwait(false);
            return Ok(new { success = true });
        }

        public class EtapasTourBody
        {
            public string? Json { get; set; }
        }
    }
}
