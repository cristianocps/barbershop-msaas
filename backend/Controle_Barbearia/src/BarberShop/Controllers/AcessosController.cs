using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using BarberShop.Infraestrutura.padronizar;
using BarberShop.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static BarberShop.Dominio.Enuns.IResponseController;

namespace BarberShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AcessosController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IUsuarioServicos _usuarioServicos;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AcessosController(
            UserManager<IdentityUser> userManager, 
            SignInManager<IdentityUser> signInManager, 
            IConfiguration configuration,
            IUsuarioServicos usuarioServicos,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _usuarioServicos = usuarioServicos;
            _roleManager = roleManager;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] RegistroModel model)
        {
            try
            {

                if (!ModelState.IsValid) return BadRequest(ModelState);

                var user = new IdentityUser { UserName = model.Email, Email = model.Email, EmailConfirmed = true };
                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    // Atribui o perfil básico (Consulta)
                    var role = await _roleManager.FindByNameAsync("Consulta");
                    if (role != null)
                    {
                        await _userManager.AddToRoleAsync(user, role.Name!);
                    }

                    // Cria o registro na tabela de negócios (Usuario) para persistir dados básicos
                    var usuarioNegocio = new Usuario
                    {
                        ID = 0,
                        Status = 1,
                        Cidade = "Não informada",
                        Descricao = "Usuário registrado pelo portal",
                        Documento = "00000000000",
                        DtCriacao = DateTime.Now,
                        Email = model.Email,
                        Logon = model.Email,
                        Telefone = "00000000000",
                        IdEmpresa = 1, // Empresa padrão para novos registros
                        IdClains = user.Id,
                        Senha = model.Password
                    };

                    await _usuarioServicos.AlterarUsuarios(usuarioNegocio);

                    var token = await GenerateJwtToken(user);
                    return Ok(new
                    {
                        Token = token,
                        Expiration = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:ExpirationInMinutes"]!))
                    });
                }

                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description.Traduzir());
                }
                return BadRequest(ModelState);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message.Traduzir() });
            }

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    return Unauthorized(new { Message = "Usuário não encontrado." });
                }

                var result = await _userManager.CheckPasswordAsync(user, model.Password);

                if (result)
                {
                    var token = await GenerateJwtToken(user);
                    return Ok(new
                    {
                        Token = token,
                        Expiration = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:ExpirationInMinutes"]!))
                    });
                }

                // Se falhou, vamos verificar se é bloqueio ou senha errada
                if (await _userManager.IsLockedOutAsync(user))
                {
                    return Unauthorized(new { Message = "Conta bloqueada temporariamente." });
                } 

                return Unauthorized(new { Message = "Senha inválida." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message.Traduzir() });
            }
           
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { Message = "Logout realizado com sucesso. (Lembre-se que tokens JWT devem ser descartados no lado do cliente)" });
        }

        private async Task<string> GenerateJwtToken(IdentityUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!)

            };
            
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var secretKey = _configuration["JwtSettings:Secret"];
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT Secret Key is not configured in appsettings.json");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var expirationMinutes = double.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "60");
            var expires = DateTime.UtcNow.AddMinutes(expirationMinutes);

            var token = new JwtSecurityToken(
                _configuration["JwtSettings:Issuer"],
                _configuration["JwtSettings:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
