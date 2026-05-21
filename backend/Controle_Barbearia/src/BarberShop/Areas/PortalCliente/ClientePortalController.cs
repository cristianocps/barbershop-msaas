using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BarberShop.Areas.PortalCliente
{
    [Authorize(Roles = "Cliente")]
    [ApiController]
    [Route("api/[controller]")]
    public class PortalClienteController : ControllerBase
    {
        private readonly IClientePortalServicos _portal;

        public PortalClienteController(IClientePortalServicos portal) => _portal = portal;

        private string IdClains => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        [HttpGet("agendamentos")]
        public async Task<IActionResult> ListarAgendamentos()
        {
            var lista = await _portal.ListarAgendamentosAsync(IdClains).ConfigureAwait(false);
            return Ok(new { data = lista });
        }

        [HttpGet("perfil")]
        public async Task<IActionResult> ObterPerfil()
        {
            var perfil = await _portal.ObterPerfilAsync(IdClains).ConfigureAwait(false);
            if (perfil == null) return NotFound();
            return Ok(new { data = perfil });
        }

        [HttpPut("perfil")]
        public async Task<IActionResult> AtualizarPerfil([FromBody] ContaCliente model)
        {
            await _portal.AtualizarPerfilAsync(IdClains, model).ConfigureAwait(false);
            return Ok(new { success = true });
        }
    }
}
