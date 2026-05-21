using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using BarberShop.Infraestrutura.padronizar;
using BarberShop.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BarberShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AcessosController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IAuthProvisioningServicos _authProvisioning;

        public AcessosController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IConfiguration configuration,
            IAuthProvisioningServicos authProvisioning)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _authProvisioning = authProvisioning;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] RegistroModel model)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                if (model.Password != model.ConfirmPassword)
                    return BadRequest(new { mensagem = "As senhas não conferem." });

                var result = await _authProvisioning.ProvisionAsync(new AuthProvisioningRequest
                {
                    Email = model.Email,
                    Password = model.Password,
                    TipoCadastro = model.TipoCadastro,
                    Nome = model.Nome,
                    Telefone = model.Telefone
                }).ConfigureAwait(false);

                var user = await _userManager.FindByIdAsync(result.UserId).ConfigureAwait(false);
                if (user == null) return BadRequest(new { mensagem = "Usuário não encontrado após cadastro." });
                return await TokenResponseAsync(user).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message.Traduzir() });
            }
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginModel model)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var clientId = _configuration["Google:ClientId"];
                if (string.IsNullOrWhiteSpace(clientId))
                    return BadRequest(new { mensagem = "Login com Google não configurado." });

                var payload = await GoogleJsonWebSignature.ValidateAsync(
                    model.IdToken,
                    new GoogleJsonWebSignature.ValidationSettings { Audience = [clientId] }).ConfigureAwait(false);

                var email = payload.Email;
                if (string.IsNullOrWhiteSpace(email))
                    return BadRequest(new { mensagem = "E-mail não disponível na conta Google." });

                var existing = await _userManager.FindByEmailAsync(email).ConfigureAwait(false);
                var tipo = model.TipoCadastro;

                if (existing == null && string.IsNullOrWhiteSpace(tipo))
                    return Ok(new { requiresTipoCadastro = true });

                var result = await _authProvisioning.ProvisionAsync(new AuthProvisioningRequest
                {
                    Email = email,
                    TipoCadastro = tipo ?? "Barbearia",
                    Nome = model.Nome ?? payload.Name,
                    Telefone = model.Telefone,
                    GoogleSub = payload.Subject
                }).ConfigureAwait(false);

                if (result.RequiresTipoCadastro)
                    return Ok(new { requiresTipoCadastro = true });

                var user = await _userManager.FindByIdAsync(result.UserId).ConfigureAwait(false);
                if (user == null) return BadRequest(new { mensagem = "Usuário não encontrado." });
                return await TokenResponseAsync(user).ConfigureAwait(false);
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new { mensagem = "Token Google inválido ou expirado." });
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
                    return Unauthorized(new { Message = "Usuário não encontrado." });

                var hasPassword = await _userManager.HasPasswordAsync(user).ConfigureAwait(false);
                if (!hasPassword)
                    return Unauthorized(new { Message = "Esta conta usa login com Google." });

                var result = await _userManager.CheckPasswordAsync(user, model.Password);

                if (result)
                    return await TokenResponseAsync(user).ConfigureAwait(false);

                if (await _userManager.IsLockedOutAsync(user))
                    return Unauthorized(new { Message = "Conta bloqueada temporariamente." });

                return Unauthorized(new { Message = "Senha inválida." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message.Traduzir() });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var email = User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized();

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized();

            var roles = (await _userManager.GetRolesAsync(user).ConfigureAwait(false)).ToList();
            var isCliente = roles.Contains("Cliente", StringComparer.OrdinalIgnoreCase);

            return Ok(new
            {
                email,
                name = user.UserName,
                roles,
                accountType = isCliente ? "cliente" : "barbearia"
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { Message = "Logout realizado com sucesso." });
        }

        private async Task<IActionResult> TokenResponseAsync(IdentityUser user)
        {
            var token = await GenerateJwtToken(user);
            var roles = (await _userManager.GetRolesAsync(user).ConfigureAwait(false)).ToList();
            var isCliente = roles.Contains("Cliente", StringComparer.OrdinalIgnoreCase);
            return Ok(new
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:ExpirationInMinutes"]!)),
                Roles = roles,
                AccountType = isCliente ? "cliente" : "barbearia"
            });
        }

        private async Task<string> GenerateJwtToken(IdentityUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.Email, user.Email ?? user.UserName ?? "")
            };

            var roles = await _userManager.GetRolesAsync(user);
            var rolesJson = System.Text.Json.JsonSerializer.Serialize(roles);
            claims.Add(new Claim("app_roles", rolesJson));
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                claims.Add(new Claim("role", role));
            }

            var secretKey = _configuration["JwtSettings:Secret"]
                ?? throw new InvalidOperationException("JWT Secret Key is not configured");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expirationMinutes = double.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "60");

            var token = new JwtSecurityToken(
                _configuration["JwtSettings:Issuer"],
                _configuration["JwtSettings:Audience"],
                claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
