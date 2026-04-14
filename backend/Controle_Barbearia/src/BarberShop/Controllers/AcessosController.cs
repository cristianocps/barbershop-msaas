using BarberShop.Models;
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

        public AcessosController(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] RegistroModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = new IdentityUser { UserName = model.Email, Email = model.Email, EmailConfirmed = true };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                var token = await GenerateJwtToken(user);
                return Ok(new 
                { 
                    Token = token, 
                    Expiration = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:ExpirationInMinutes"]!)) 
                });
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return BadRequest(ModelState);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
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
