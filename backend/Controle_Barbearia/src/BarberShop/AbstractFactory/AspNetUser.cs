using BarberShop.Dominio.Interfaces.Base;
using System.Security.Claims;

namespace Gestao_Winsiga.Apresentacao.AbstractFactory
{
    public class AspNetUser : IUser
    {
        private readonly IHttpContextAccessor _accessor;
        public AspNetUser(IHttpContextAccessor accessor)
        {
            _accessor = accessor;
        }

        public string Name => _accessor?.HttpContext?.User?.Identity?.Name ?? "";

        public ClaimsIdentity ClaimsIdentity => (ClaimsIdentity)(_accessor?.HttpContext?.User?.Identity ?? new ClaimsIdentity());

        public bool IsAuthenticated()
        {
            return _accessor?.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
        }

        public IEnumerable<Claim> GetClaimsIdentity()
        {
            if(_accessor == null)
                return Enumerable.Empty<Claim>();

            if (_accessor.HttpContext == null)
                return Enumerable.Empty<Claim>();

            if (_accessor.HttpContext.User == null)
                return Enumerable.Empty<Claim>();

            if (_accessor.HttpContext.User.Claims == null)
                return Enumerable.Empty<Claim>();

            return _accessor.HttpContext.User.Claims ?? Enumerable.Empty<Claim>();
        }
    }
}
